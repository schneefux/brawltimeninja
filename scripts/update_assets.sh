#!/bin/bash

node download_maps.js
node download_translations.js
node scraper.js

find ./out -type f -iname '*.ogg' -print0 | xargs -0 -I{} sh -c 'ffmpeg -i "{}" -ab 192k "${0%.*}.mp3" -hide_banner -loglevel error -y' {} \;

sftp -q -r -P 2222 -i ~/.ssh/brawlbot.key brawlbot@ssh.brawltime.ninja << EOT
  put ./static/* /brawlbot/assets/
  put ./out/* /brawlbot/assets/
  quit
EOT
