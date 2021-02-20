#!/bin/bash

node download_apk.js
unzip -q -o brawlstars.apk -d brawlstars
python csv_to_json.py
node prepare_json.js
node download_maps.js
node download_translations.js
sftp -r -i ~/.ssh/brawlbot.key brawlbot@schneefux.xyz << EOT
  put ./out/* /brawlbot/assets/
  quit
EOT
