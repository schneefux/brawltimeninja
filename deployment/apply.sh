#!/bin/bash
INGRESS_IP=$(terraform output -raw ingress_ip4)
INGRESS_SSHKEY=$(terraform output -raw ingress_ssh_key)

# proxy Nomad, Consul and Traefik
ssh -o StrictHostKeyChecking=no -i $INGRESS_SSHKEY -L 4646:localhost:4646 -L 8500:localhost:8500 -L 8080:localhost:8080 root@$INGRESS_IP &

terraform apply -var-file vars.tfvars -var="start_proxy=false"
