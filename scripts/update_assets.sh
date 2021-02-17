#!/bin/bash

node download_apk.js
unzip -q -o brawlstars.apk -d brawlstars
python csv_to_json.py
node prepare_json.js
node download_maps.js
find ./out/ -iname '*.png' | while read f
do
  magick "$f" -strip "${f%.png}.webp"
done
sftp -r -i ~/.ssh/brawlbot.key brawlbot@schneefux.xyz << EOT
  put ./out/* /brawlbot/assets/
  quit
EOT
