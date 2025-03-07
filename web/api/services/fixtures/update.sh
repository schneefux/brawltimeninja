#!/bin/bash

for BRAWLER in "Edgar" "Nita" "Shelly" "Shade" "Bonnie"; do
  curl -s -o ./fandom-$BRAWLER.html "https://brawlstars.fandom.com/wiki/$BRAWLER"
  curl -s -o ./fandom-$BRAWLER.json "https://brawlstars.fandom.com/api.php?action=query&format=json&maxlag=5&origin=*&prop=revisions%7Cpageprops&redirects=true&rvprop=content%7Cids%7Ctimestamp&rvslots=main&titles=$BRAWLER"
done

. ../../../.env

SINCE=$(date -v-1m +"%Y-%m-%d")

while true
do
  curl -s -o ./cube-brawlers.json -H "Authorization: Bearer $CUBE_TOKEN_TEST" "https://cube.brawltime.ninja/cubejs-api/v1/load?query=%7B%22measures%22%3A%5B%5D%2C%22dimensions%22%3A%5B%22map.brawler_dimension%22%5D%2C%22filters%22%3A%5B%7B%22member%22%3A%22map.season_dimension%22%2C%22operator%22%3A%22gte%22%2C%22values%22%3A%5B%22${SINCE}%22%5D%7D%5D%2C%22order%22%3A%7B%22map.picks_measure%22%3A%22desc%22%7D%7D&queryType=multi"
  grep ./cube-brawlers.json -e "Continue wait" || break
  echo "Waiting for cube-brawlers.json"
done

while true
do
  curl -s -o ./cube-starpowers.json -H "Authorization: Bearer $CUBE_TOKEN_TEST" "https://cube.brawltime.ninja/cubejs-api/v1/load?query=%7B%22measures%22%3A%5B%22battle.starpowerName_measure%22%2C%22battle.brawler_measure%22%5D%2C%22dimensions%22%3A%5B%22battle.brawler_dimension%22%2C%22battle.starpower_dimension%22%5D%2C%22filters%22%3A%5B%7B%22member%22%3A%22battle.season_dimension%22%2C%22operator%22%3A%22gte%22%2C%22values%22%3A%5B%22${SINCE}%22%5D%7D%2C%7B%22member%22%3A%22battle.starpower_dimension%22%2C%22operator%22%3A%22notEquals%22%2C%22values%22%3A%5B%220%22%5D%7D%5D%2C%22order%22%3A%7B%22battle.picks_measure%22%3A%22desc%22%7D%7D&queryType=multi"
  grep ./cube-starpowers.json -e "Continue wait" || break
  echo "Waiting for cube-starpowers.json"
done

while true
do
curl -s -o ./cube-gadgets.json -H "Authorization: Bearer $CUBE_TOKEN_TEST" "https://cube.brawltime.ninja/cubejs-api/v1/load?query=%7B%22measures%22%3A%5B%22battle.gadgetName_measure%22%2C%22battle.brawler_measure%22%5D%2C%22dimensions%22%3A%5B%22battle.brawler_dimension%22%2C%22battle.gadget_dimension%22%5D%2C%22filters%22%3A%5B%7B%22member%22%3A%22battle.season_dimension%22%2C%22operator%22%3A%22gte%22%2C%22values%22%3A%5B%22${SINCE}%22%5D%7D%2C%7B%22member%22%3A%22battle.gadget_dimension%22%2C%22operator%22%3A%22notEquals%22%2C%22values%22%3A%5B%220%22%5D%7D%5D%2C%22order%22%3A%7B%22battle.picks_measure%22%3A%22desc%22%7D%7D&queryType=multi"
  grep ./cube-gadgets.json -e "Continue wait" || break
  echo "Waiting for cube-gadgets.json"
done
