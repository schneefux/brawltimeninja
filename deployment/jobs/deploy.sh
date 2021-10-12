#!/bin/bash
COMMIT=${1:-$(git rev-parse HEAD)}
HASH=$(echo $COMMIT | cut -c1-7)
find -iname "brawltime-*.nomad" -exec nomad run -var-file vars.nomadvars -var="tag=sha-$HASH" {} \;
