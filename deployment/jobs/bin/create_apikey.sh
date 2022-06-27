#!/bin/bash

while getopts ":e:p:n:d:i:" arg
do
  case $arg in
    e)
      EMAIL=$OPTARG
      ;;
    p)
      PASSWORD=$OPTARG
      ;;
  esac
done

[ -z "$EMAIL" ] && echo "-e is required"
[ -z "$PASSWORD" ] && echo "-p is required"
NAME="Nomad $NOMAD_ALLOC_ID"
DESCRIPTION="Key automatically registered by Nomad job for allocation $NOMAD_ALLOC_ID on host $(hostname)"

COOKIE_JAR=$(mktemp)

echo "Logging in"
curl 'https://developer.brawlstars.com/api/login' \
  -s \
  -o /dev/null \
  -H 'authority: developer.brawlstars.com' \
  -H 'content-type: application/json' \
  --data-raw "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -c $COOKIE_JAR

echo "Retrieving keys"
KEYS=$(curl 'https://developer.brawlstars.com/api/apikey/list' \
  -s \
  -H 'authority: developer.brawlstars.com' \
  -H 'content-type: application/json' \
  --data-raw '{}' \
  -b $COOKIE_JAR)

TOKEN=$(echo $KEYS | jq -r ".keys[] | select(.name == \"$NAME\").key")

if [ "$TOKEN" = "null" ]
then
  echo "Error: Token is null - did you register too many tokens?"
  exit 1
fi

if [ -z "$TOKEN" ]
then
  echo "Creating a new token"
  MY_IP=$(dig @resolver4.opendns.com myip.opendns.com +short)
  IPS="[\"$MY_IP\"]"
  TOKEN=$(curl 'https://developer.brawlstars.com/api/apikey/create' \
    -s \
    -H 'authority: developer.brawlstars.com' \
    -H 'content-type: application/json' \
    --data-raw "{\"name\":\"$NAME\",\"description\":\"$DESCRIPTION\",\"cidrRanges\":$IPS,\"scopes\":null}" \
    -b $COOKIE_JAR \
    | jq -r ".key.key")
else
  echo "Token already exists"
fi

consul kv put "brawlstars-token/alloc-${NOMAD_ALLOC_ID}" "$TOKEN"

rm $COOKIE_JAR
