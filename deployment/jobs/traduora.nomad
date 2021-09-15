variable "traduora_google_client_id" {}
variable "traduora_google_client_secret" {}
variable "traduora_secret" {}

job "traduora" {
  datacenters = ["dc1"]

  group "traduora" {
    network {
      port "http" {}
    }

    service {
      name = "traduora"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.traduora.rule=Host(`translate.brawltime.ninja`)",
      ]

      check {
        type = "http"
        path = "/health"
        interval = "2s"
        timeout = "2s"
      }
    }

    task "traduora" {
      driver = "docker"

      env {
        NODE_ENV = "production"
        TR_PORT = "${NOMAD_PORT_http}"
        TR_DB_USER = "traduora"
        TR_DB_PASSWORD = "traduora"
        TR_DB_DATABASE = "traduora"
        TR_SIGNUPS_ENABLED = "false"
        TR_AUTH_GOOGLE_ENABLED = "true"
        TR_AUTH_GOOGLE_REDIRECT_URL = "https://translate.brawltime.ninja/auth/callback"
        TR_AUTH_GOOGLE_CLIENT_ID = var.traduora_google_client_id
        TR_AUTH_GOOGLE_CLIENT_SECRET = var.traduora_google_client_secret
        TR_SECRET = var.traduora_secret
      }

      template {
        data = <<EOF
          TR_DB_HOST={{ range service "mariadb" }}{{ .Address }}{{ end }}
          TR_DB_PORT={{ range service "mariadb" }}{{ .Port }}{{ end }}
        EOF
        destination = "local/traduora.env"
        env = true
      }

      config {
        image = "everco/ever-traduora:latest"
        ports = ["http"]
      }

      resources {
        cpu = 100
        memory = 128
      }
    }
  }
}
