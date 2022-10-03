#!/bin/bash

# workaround for https://github.com/hashicorp/nomad/issues/10927
NODES=$(nomad node status | tail -n +2 | cut -d " " -f 1)
echo "$NODES" | xargs echo nomad volume detach $1
echo "$NODES" | xargs -I% nomad volume detach $1 %
