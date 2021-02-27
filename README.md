# brawltimeninja

Fun game statistics site for Brawlstars.

https://brawltime.ninja

## Style Guide
```
gray-900: dark background
gray-200: light text
gray-100: light background
gray-800: dark text

yellow-400: primary
yellow-600: primary darker
yellow-200: primary light background
yellow-900: primary background
red-600: secondary
red-500: secondary text
```

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

## Deployment

* Dokku Docker options to connect services: `docker-options:add brawltime.ninja build,deploy,run "--add-host api.brawltime.ninja:host-gateway`
* Mount asset directory: `storage:mount media.brawltime.ninja /mnt/brawltime/assets:/assets`

## Assets

https://www.dropbox.com/sh/mhed0l7szljxvgv/AAAf-YPn4nXS_cuozHX09URoa

## Netlify CMS setup

See: http://www.vxk.cz/tips/2017/05/18/netlify-cms/

Optionally, set `SCOPES="public_repo,user"` to reduce the required permissions (see also https://github.com/netlify/netlify-cms/issues/4329).
