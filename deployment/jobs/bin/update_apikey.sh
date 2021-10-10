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
    n)
      NAME=$OPTARG
      ;;
    d)
      DESCRIPTION=$OPTARG
      ;;
    i)
      IPS=$OPTARG
      ;;
  esac
done

[ -z $EMAIL ] && echo "-e is required"
[ -z $PASSWORD ] && echo "-p is required"
[ -z $NAME ] && NAME="Nomad $(hostname)"
[ -z $DESCRIPTION ] && DESCRIPTION="Key automatically registered by Nomad job"
if [ -z $IPS ]
then
  MY_IP=$(dig @resolver4.opendns.com myip.opendns.com +short)
  IPS="[\"$MY_IP\"]"
fi

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

TOKEN=$(echo $KEYS | jq -r ".keys[] | select(.name == \"$NAME\" and .cidrRanges == $IPS).key")

if [ -z $TOKEN ]
then
  echo "Could not find existing token"

  KEY_ID=$(echo $KEYS | jq -r ".keys[] | select(.name == \"$NAME\").id")

  if [ ! -z "$KEY_ID" ]
  then
    echo "Revoking token with same name"
    curl 'https://developer.brawlstars.com/api/apikey/revoke' \
      -s \
      -o /dev/null \
      -H 'authority: developer.brawlstars.com' \
      -H 'content-type: application/json' \
      --data-raw "{\"id\":\"$KEY_ID\"}" \
      -b $COOKIE_JAR
  fi

  echo "Creating a new token"
  TOKEN=$(curl 'https://developer.brawlstars.com/api/apikey/create' \
    -s \
    -H 'authority: developer.brawlstars.com' \
    -H 'content-type: application/json' \
    --data-raw "{\"name\":\"$NAME\",\"description\":\"$DESCRIPTION\",\"cidrRanges\":$IPS,\"scopes\":null}" \
    -b $COOKIE_JAR \
    | jq -r ".key.key")
fi

consul kv put "brawlstars-token/alloc-${NOMAD_ALLOC_ID}" "$TOKEN"

rm $COOKIE_JAR
