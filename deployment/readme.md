terraform plan -var-file="vars.tfvars"
terraform apply -var-file="vars.tfvars"

DOCKER_HOST="ssh://root@translate.brawltime.ninja" docker stack deploy -c traduora.yml traduora

ssh -L 4646:10.0.0.2:4646 -L 8500:localhost:8500 -L 8080:10.0.0.2:8500 translate.brawltime.ninja
