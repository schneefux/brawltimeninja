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

MY_IP=$(dig @resolver4.opendns.com myip.opendns.com +short)

NAME="Nomad client $MY_IP"
DESCRIPTION="Key automatically registered by Nomad allocation $NOMAD_ALLOC_ID for $NOMAD_ALLOC_NAME on $(hostname)"

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

if [ "$KEYS" = "null" ]
then
  echo "Error: KEYS is null - did you register too many tokens?"
  exit 1
fi

TOKEN=$(echo $KEYS | jq -r ".keys[] | select(.name == \"$NAME\").key")

if [ -z "$TOKEN" ]
then
  echo "Creating a new token $NAME"
  IPS="[\"$MY_IP\"]"
  TOKEN=$(curl 'https://developer.brawlstars.com/api/apikey/create' \
    -s \
    -H 'authority: developer.brawlstars.com' \
    -H 'content-type: application/json' \
    --data-raw "{\"name\":\"$NAME\",\"description\":\"$DESCRIPTION\",\"cidrRanges\":$IPS,\"scopes\":null}" \
    -b $COOKIE_JAR \
    | jq -r ".key.key")
else
  echo "Token $NAME already exists"
fi

echo "Testing token"
TOKEN_CHECK_STATUS=$(curl https://api.brawlstars.com/v1/ -H "Authorization: Bearer $TOKEN" --write-out %{http_code} --silent --output /dev/null)
if [ "$TOKEN_CHECK_STATUS" != "200" ]
then
  echo "Invalid token, received status $TOKEN_CHECK_STATUS"
  exit 1
fi

consul kv put "brawlstars-token/alloc-${NOMAD_ALLOC_ID}" "$TOKEN"

rm $COOKIE_JAR
