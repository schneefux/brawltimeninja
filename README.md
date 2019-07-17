# brawltimeninja

Fun game statistics site for Brawlstars.

https://brawltime.ninja

## Build Setup

``` bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ BRAWLAPI_TOKEN="…" BRAWLSTARS_TOKEN="…" TRACKER_URL="http://localhost:3002/tracker" npm run dev:api
$ DATABASE_URI="mysql2://user:pass@host/db" npm run dev:tracker
$ API_PORT=3001 npm run dev

# build for production and launch server
$ npm run generate:api
$ npm run build:functions
$ API_URL_BROWSER="..." npm run build
$ BRAWLAPI_TOKEN="…" BRAWLSTARS_TOKEN="…" TRACKER_URL="…" node functions/dist/apps/api.js
$ DATABASE_URI="…" node functions/dist/apps/tracker.js
$ API_PORT="…" npm start
```

For detailed explanation on how things work, checkout [Nuxt.js docs](https://nuxtjs.org).

## Processing images

* `for f in assets/images/hero/icon/*.png; do magick.exe "$f" -strip -resize x192 "${f%.png}_optimized.png"; done` 
* `for f in assets/images/icon/*.png; do magick.exe "$f" -strip -resize x40 "${f%.png}_optimized.png"; done`
* `for f in assets/images/mode/background/*.png; do magick.exe "$f" -sampling-factor 4:2:0 -strip -quality 85 -resize x256 "${f%.png}.jpg"; done`
* `for f in assets/images/mode/icon/*.png; do magick.exe "$f" -sampling-factor 4:2:0 -strip -quality 85 -interlace JPEG -resize x96 "${f%.png}_optimized.png"; done`
* `for f in assets/images/blog/guides/*.jpg; do magick.exe "$f" -strip -resize 800x "${f%.jpg}_small.jpg"; done`

## Assets

https://www.dropbox.com/sh/mhed0l7szljxvgv/AAAf-YPn4nXS_cuozHX09URoa
