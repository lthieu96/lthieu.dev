# /// script
# dependencies = ["pikepdf", "fonttools"]
# ///
"""Embed Berkeley Mono, cut down to the glyphs the résumé uses, into resume-berkeley.pdf.

xdvipdfmx (tectonic) leaves Berkeley Mono out of the PDF: the font files set "no subsetting"
(OS/2 fsType 0x0100) and xdvipdfmx only embeds subsets, so on a machine without the font the PDF
falls back to another one. Subsetting here is the owner's call under their licence.

xdvipdfmx writes glyph IDs as CIDs (Identity), so the glyph IDs drawn in the page content are read
back, each font is subset to exactly those (IDs kept), then added as FontFile2. (Its /CIDSet can't be
used for this: it marks nearly every glyph.)

Run after tectonic:  uv run embed-fonts.py resume-berkeley.pdf
"""

import io
import random
import string
import sys
from pathlib import Path

import pikepdf
from fontTools import subset
from fontTools.ttLib import TTFont

FONTS = Path.home() / "Library/Fonts"
# PostScript name in the PDF -> file name on disk
FILES = {
    "BerkeleyMono-Regular": "Berkeley Mono Regular.ttf",
    "BerkeleyMono-Medium": "Berkeley Mono Medium.ttf",
    "BerkeleyMono-SemiBold": "Berkeley Mono SemiBold.ttf",
    "BerkeleyMono-Oblique": "Berkeley Mono Oblique.ttf",
    "BerkeleyMono-SemiBoldOblique": "Berkeley Mono SemiBold Oblique.ttf",
}


def used_gids(page) -> dict[str, set[int]]:
    """Glyph IDs each font resource draws: Identity-H strings are 2-byte CIDs, and CID = glyph ID."""
    used, current = {}, None
    for operands, op in pikepdf.parse_content_stream(page):
        if op == pikepdf.Operator("Tf"):
            current = str(operands[0])
        elif op in (pikepdf.Operator("Tj"), pikepdf.Operator("TJ"), pikepdf.Operator("'"), pikepdf.Operator('"')):
            items = operands[0] if op == pikepdf.Operator("TJ") else [operands[-1]]
            for item in items:
                if isinstance(item, pikepdf.String):
                    raw = bytes(item)
                    used.setdefault(current, set()).update(
                        int.from_bytes(raw[i : i + 2], "big") for i in range(0, len(raw), 2)
                    )
    return used


def subset_font(path: Path, gids: list[int]) -> bytes:
    font = TTFont(path)
    opts = subset.Options()
    opts.retain_gids = True  # the PDF addresses glyphs by their original IDs
    opts.notdef_outline = True
    opts.name_IDs = ["*"]
    opts.layout_features = []  # shaping already happened in TeX
    sub = subset.Subsetter(opts)
    sub.populate(gids=gids)
    sub.subset(font)
    out = io.BytesIO()
    font.save(out)
    return out.getvalue()


path = Path(sys.argv[1])
pdf = pikepdf.open(path, allow_overwriting_input=True)
gids_by_font = {}
for page in pdf.pages:
    for res, gids in used_gids(page).items():
        gids_by_font.setdefault(page.Resources.Font[res].objgen, set()).update(gids)

done = {}
for page in pdf.pages:
    for font in page.Resources.Font.values():
        name = str(font.BaseFont)[1:]
        if not name.startswith("BerkeleyMono") or name in done:
            continue
        if name not in FILES:
            sys.exit(f"no file mapped for {name}: add it to FILES")
        cid_font = font.DescendantFonts[0]
        desc = cid_font.FontDescriptor
        data = subset_font(FONTS / FILES[name], [0, *sorted(gids_by_font[font.objgen])])
        desc.FontFile2 = pikepdf.Stream(pdf, data, Length1=len(data))
        if "/CIDSet" in desc:
            del desc["/CIDSet"]  # optional, and xdvipdfmx's is wrong (see above)
        # A subset font's names carry a six-letter tag (PDF 32000, 9.6.4).
        tagged = pikepdf.Name("/" + "".join(random.choices(string.ascii_uppercase, k=6)) + "+" + name)
        font.BaseFont = cid_font.BaseFont = desc.FontName = tagged
        done[name] = len(data)

assert done, "no Berkeley Mono fonts found"
pdf.save(path, compress_streams=True)
print(f"embedded into {path}: " + ", ".join(f"{n} ({s / 1024:.0f} KB)" for n, s in sorted(done.items())))
