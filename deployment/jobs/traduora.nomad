// TODO
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
        "traefik.http.routers.http.rule=Path(`/traduora`)",
      ]

      check {
        type = "http"
        path = "/"
        interval = "2s"
        timeout = "2s"
      }
    }

    task "traduora" {
      driver = "docker"

      env {
        TR_DB_USER = "tr"
        TR_DB_PASSWORD = "change_me"
        TR_DB_DATABASE = "traduora"
        TR_SIGNUPS_ENABLED = "'false'"
        TR_AUTH_GOOGLE_ENABLED = "'true'"
        TR_AUTH_GOOGLE_REDIRECT_URL = "https://translate.brawltime.ninja/auth/callback"
        NODE_ENV = "production"
      }

      template {
        data = <<EOF
          TR_DB_HOST={{ env NOMAD_HOST_db }}
          TR_DB_PORT={{ env NOMAD_PORT_db }}
        EOF

        env = true
      }

      config {
        image = "everco/ever-traduora:latest"
      }

      resources {
        cpu = 100
        memory = 128
      }
    }
  }
}
