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
