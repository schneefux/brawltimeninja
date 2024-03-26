# workaround for zombie service instances
# https://github.com/hashicorp/nomad/issues/16616#issuecomment-1748006168

job "nomad-invalid-services-cleaner" {
  type = "batch"

  periodic {
    prohibit_overlap = true
    cron = "0/10 * * * * *"
    time_zone = "Europe/Berlin"
  }

  group "services_cleaner" {
    task "cleaner" {
      driver = "docker"

      config {
        image = "ghcr.io/icyleaf/nomad-invalid-services-cleaner:0.1"
      }

      template {
        destination = "secrets/.env"
        env = true
        data = <<-EOF
        ONESHOT = true
        NOMAD_ENDPOINT = http://{{ env "attr.unique.network.ip-address" }}:4646
        EOF
      }

      resources {
        cpu = 50
        memory  = 50
      }
    }
  }
}
