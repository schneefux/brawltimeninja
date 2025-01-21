#!/bin/bash

for BRAWLER in "edgar" "nita" "shelly" "shade" "bonnie"; do
  curl -s -o ./fandom-$BRAWLER.html "https://brawlstars.fandom.com/wiki/$BRAWLER"
  curl -s -o ./fandom-$BRAWLER.json "https://brawlstars.fandom.com/api.php?action=query&format=json&maxlag=5&origin=*&prop=revisions%7Cpageprops&redirects=true&rvprop=content%7Cids%7Ctimestamp&rvslots=main&titles=$BRAWLER"
done
