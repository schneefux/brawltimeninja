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

[ -z $EMAIL ] && echo "-e is required"
[ -z $PASSWORD ] && echo "-p is required"
NAME="Nomad $NOMAD_ALLOC_ID"

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

KEY_ID=$(echo $KEYS | jq -r ".keys[] | select(.name == \"$NAME\").id")

if [ ! -z "$KEY_ID" ]
then
  echo "Revoking token"
  curl 'https://developer.brawlstars.com/api/apikey/revoke' \
    -s \
    -o /dev/null \
    -H 'authority: developer.brawlstars.com' \
    -H 'content-type: application/json' \
    --data-raw "{\"id\":\"$KEY_ID\"}" \
    -b $COOKIE_JAR
else
  echo "No token found"
fi

consul kv delete "brawlstars-token/alloc-${NOMAD_ALLOC_ID}"

rm $COOKIE_JAR
