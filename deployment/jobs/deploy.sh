#!/bin/bash
find -iname "brawltime-*.nomad" -exec nomad run -var-file vars.nomadvars -var="tag=sha-$(git rev-parse HEAD | cut -c1-7)" {} \;
