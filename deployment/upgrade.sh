#!/bin/sh

for IP in "$@"; do
    ssh -i ~/.ssh/brawltime.key "root@$IP" "apt-get update && apt-get upgrade -y"
done
