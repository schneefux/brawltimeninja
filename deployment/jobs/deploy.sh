#!/bin/bash
COMMIT=${1:-$(git rev-parse HEAD)}
FILES=${2:-$(find -iname "brawltime-*.nomad")}
HASH=$(echo $COMMIT | cut -c1-7)
echo "$FILES" | xargs -I% nomad run -var-file vars.nomadvars -var="tag=sha-$HASH" %
