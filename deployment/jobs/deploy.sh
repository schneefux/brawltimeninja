#!/bin/bash
FILES=${1:-$(find . -name "brawltime-*.nomad")}
COMMIT=${2:-$(git rev-parse HEAD)}
HASH=$(echo $COMMIT | cut -c1-7)
echo "$FILES" | xargs -I% ./nomad run -hcl2-strict=false -preserve-counts -var-file vars.nomadvars -var="tag=sha-$HASH" %
