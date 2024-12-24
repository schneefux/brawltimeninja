#!/bin/sh

for IP in "$@"; do
    ssh -o "StrictHostKeyChecking no" -i ~/.ssh/brawltime.key "root@$IP" "apt-get update && apt-get upgrade -y"
done
