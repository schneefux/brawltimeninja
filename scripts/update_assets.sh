#!/bin/bash

node download_maps.js
node download_translations.js
node scraper.js
sftp -r -P 2222 -i ~/.ssh/brawlbot.key brawlbot@ssh.brawltime.ninja << EOT
  put ./static/* /brawlbot/assets/
  put ./out/* /brawlbot/assets/
  quit
EOT
