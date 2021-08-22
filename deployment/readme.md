terraform plan -var-file="vars.tfvars"
terraform apply -var-file="vars.tfvars"

DOCKER_HOST="ssh://root@translate.brawltime.ninja" docker stack deploy -c traduora.yml traduora
