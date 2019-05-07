# brawlstarstimeninja

Fun game statistics site for Brawlstars.

https://brawlstarstime.ninja

## Build Setup

``` bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev:api
$ npm run dev:tracker
$ npm run dev

# build for production and launch server
$ API_URL_BROWSER="..." npm run build
$ npm run build:backend
$ npm start
$ npm start:api

# generate static project
$ npm run generate:api
$ npm run generate
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
