#!/bin/bash

# step 1: create infrastructure
cd ./infra
terraform apply -var-file vars.tfvars

# create tunnel to Ingress
INGRESS_IP=$(terraform output -raw ingress_ip4)
INGRESS_SSHKEY=$(terraform output -raw ingress_ssh_key)
INGRESS_REMOTE=root@$INGRESS_IP
ssh -M -S tunnel-socket -fN -o StrictHostKeyChecking=no -o LogLevel=error -i $INGRESS_SSHKEY -L 4646:localhost:4646 -L 8500:localhost:8500 -L 8080:localhost:8080 $INGRESS_REMOTE

cd ..

# step 2: deploy nomad jobs to infrastructure
cd ./jobs

terraform apply -var-file vars.nomadvars

# close tunnel
ssh -S tunnel-socket -O exit $INGRESS_REMOTE

echo $INGRESS_REMOTE
