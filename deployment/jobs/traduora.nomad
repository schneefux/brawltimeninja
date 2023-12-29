variable "traduora_google_client_id" {}
variable "traduora_google_client_secret" {}
variable "traduora_secret" {}

job "traduora" {
  datacenters = ["dc1"]

  priority = 20

  constraint {
    attribute = "${node.class}"
    value = "worker"
  }

  group "traduora" {
    network {
      port "http" {}
    }

    restart {
      mode = "delay"
      interval = "5m"
    }

    service {
      name = "traduora"
      provider = "nomad"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.traduora.rule=Host(`translate.brawltime.ninja`)",
      ]

      check {
        type = "http"
        path = "/health"
        interval = "10s"
        timeout = "2s"

        check_restart {
          limit = 6
        }
      }
    }

    task "traduora" {
      driver = "docker"

      env {
        NODE_ENV = "production"
        NODE_OPTIONS = "--max-old-space-size=${NOMAD_MEMORY_MAX_LIMIT}"
        TR_PORT = "${NOMAD_PORT_http}"
        TR_DB_DATABASE = "traduora"
        TR_SIGNUPS_ENABLED = "false"
        TR_CORS_ENABLED = "true"
        TR_AUTH_GOOGLE_ENABLED = "true"
        TR_AUTH_GOOGLE_REDIRECT_URL = "https://translate.brawltime.ninja/auth/callback"
      }

      template {
        data = <<-EOF
          {{ with nomadService "mariadb" }}
          TR_DB_HOST={{ with index . 0 }}{{ .Address }}{{ end }}
          TR_DB_PORT={{ with index . 0}}{{ .Port }}{{ end }}
          {{ end }}
          TR_DB_USER="traduora"
          TR_DB_PASSWORD="traduora"
          TR_AUTH_GOOGLE_CLIENT_ID="${var.traduora_google_client_id}"
          TR_AUTH_GOOGLE_CLIENT_SECRET="${var.traduora_google_client_secret}"
          TR_SECRET="${var.traduora_secret}"
        EOF
        destination = "secrets/traduora.env"
        env = true
      }

      config {
        image = "everco/ever-traduora:latest"
        ports = ["http"]
      }

      resources {
        cpu = 128
        memory = 96
        memory_max = 256
      }
    }
  }
}
