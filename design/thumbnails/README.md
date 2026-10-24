# Project thumbnails

`cards.html` lays out the brand cards for Selected work (640×400, export at 2×).
Open it in Chrome, screenshot each `.c` element, then:

    cwebp -q 85 -resize 512 0 card-<slug>.png -o ../../public/work/<slug>/thumb.webp

Cerebro uses its X header instead of a composed card: `cerebro-x-banner.jpg`
(https://x.com/cerebro_hq, 1500×500). Thumb = 800×500 crop at x=350, preview = 1080×500 at x=210.

Sources (official, public):
- `cer-logo.svg`: Cerebro wordmark, from the cerebro-web repo (`public/images/logo.svg`)
- `bk-benkon-official-logo.png`: https://benkon.io/images/benkon-official-logo.png (the site's og:image)
- `gm-main-logo.png`: Green Master logo, from the greenmaster-web repo; the app is public on the App Store

Sway uses its own og-image (`sway/apps/web/public/og-image.png`).

BenKon's thumb is the official logo without its tagline (unreadable at 128px), with the blues
darkened so the site's dither renders the lettering solid:

    ffmpeg -f lavfi -i color=white:s=3544x1772 -i bk-benkon-official-logo.png -filter_complex \
      "[0][1]overlay=format=auto,crop=3190:642:177:549,drawbox=x=900:y=505:w=2290:h=137:color=white:t=fill,scale=340:-1,pad=512:320:(ow-iw)/2:(oh-ih)/2:white,curves=all='0/0 0.7/0.22 0.95/0.97 1/1'" \
      -frames:v 1 -c:v libwebp -quality 90 ../../public/work/benkon/thumb.webp

BenKon's preview (the hover card in the intro, shown 300×188) is the full logo at 360px on a
640×400 canvas, so the card's 16:10 crop keeps it whole:

    ffmpeg -f lavfi -i "gradients=s=640x400:c0=0xF4F9FD:c1=0xE4EEF9:x0=0:y0=0:x1=640:y1=400:d=1" \
      -i bk-benkon-official-logo.png -filter_complex \
      "[1]crop=3190:642:177:549,scale=360:-1[l];[0][l]overlay=(W-w)/2:(H-h)/2:format=auto" \
      -frames:v 1 -c:v libwebp -quality 90 ../../public/work/benkon/preview.webp
