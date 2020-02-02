# brawltimeninja

Fun game statistics site for Brawlstars.

https://brawltime.ninja

## Build Setup

For development, copy `example.env` to `.env`, fill credentials and run `docker-compose up` or follow the steps below. Note: For deployment, buildpacks (using dokku) are used and not the Dockerfiles.

```bash
# install dependencies in web/, api/ and tracker/
$ npm install

# serve with hot reload at localhost:3000
# API
$ BRAWLAPI_TOKEN="…" BRAWLSTARS_TOKEN="…" TRACKER_URL="http://localhost:3002/tracker" npm run dev
# Tracker
$ DATABASE_URI="mysql2://user:pass@host/db" npm run dev
# web
$ API_PORT=3001 npm run dev

# build for production and launch server
# in api/ and tracker/
$ npm run build
# in web/
$ API_URL_BROWSER="..." npm run build
# launch
$ BRAWLAPI_TOKEN="…" BRAWLSTARS_TOKEN="…" TRACKER_URL="…" node api/dist/api.js
$ DATABASE_URI="…" node tracker/dist/tracker.js
# in web/
$ API_PORT="…" npm start
```

For detailed explanation on how things work, checkout [Nuxt.js docs](https://nuxtjs.org).

## Maintenance

* Upload new Brawler icons: `web/assets/images/hero/icon`
* Upload new maps: `web/assets/images/bs-assets/map_images`
* `update dim_season set is_current = 0` for all seasons older than the current balance changes

## Processing images

* `for f in web/assets/images/hero/icon/*.png; do magick.exe "$f" -strip -resize x192 "${f%.png}_optimized.png"; done`
* `for f in web/assets/images/icon/*.png; do magick.exe "$f" -strip -resize x40 "${f%.png}_optimized.png"; done`
* `for f in web/assets/images/mode/background/*.png; do magick.exe "$f" -sampling-factor 4:2:0 -strip -quality 85 -resize x256 "${f%.png}.jpg"; done`
* `for f in web/assets/images/mode/icon/*.png; do magick.exe "$f" -sampling-factor 4:2:0 -strip -quality 85 -interlace JPEG -resize x96 "${f%.png}_optimized.png"; done`
* `for f in web/assets/images/blog/guides/*.jpg; do magick.exe "$f" -strip -resize 800x "${f%.jpg}_small.jpg"; done`
* `for f in web/assets/images/bs-assets/map_images/*.png; do magick.exe "$f" -strip -resize x384 -background white "${f%.png}_small.jpg"; done; mv web/assets/images/bs-assets/map_images/*_small.jpg web/assets/images/map/`

## Assets

https://www.dropbox.com/sh/mhed0l7szljxvgv/AAAf-YPn4nXS_cuozHX09URoa
