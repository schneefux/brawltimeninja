# brawltimeninja

Statistics site for the Brawl Stars mobile game by Supercell

https://brawltime.ninja

## Development setup

### Frontend only

  * Enter `web/` and install dependencies: `yarn install`
  * Register a Brawl Stars API token and set the `BRAWLSTARS_TOKEN` environment variable or find a proxy and set `BRAWLSTARS_URL`
  * Register a BrawlApi token and set `BRAWLAPI_TOKEN`
  * By default, the frontend will use meta statistics and assets from the production services

### Full stack

In addition to the above:

  * Install Docker and run `docker compose up` in the project root to start both databases
  * Enter the folders `scripts/`, `cube/`, `media/`, `render/` and install dependencies: `yarn install`
  * From inside `scripts/`, run `bash update_assets.sh` to download images, translations, etc. for the media service
  * Start the services from their respective folders:
    * cube: `CUBEJS_DB_HOST=localhost yarn run dev` (https://cube.dev/docs/config/databases/clickhouse)
    * media: `ASSET_DIR=../scripts/out yarn run dev`
    * render: `WEB_URL=http://localhost:3000 yarn run dev`
  * Start the web service with `MEDIA_URL=http://localhost:3003 RENDER_URL=http://localhost:3005 CUBE_URL=http://localhost:4000 CLICKHOUSE_HOST=localhost BRAWLSTARS_TOKEN=brawlstarstoken BRAWLAPI_TOKEN=brawlapitoken yarn run dev`
