variable "brawlstars_token" {}
variable "brawlapi_token" {}

job "brawltime" {
  datacenters = ["dc1"]

  group "web" {
    network {
      port "http" {}
    }

    service {
      name = "brawltime-web"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-web.rule=PathPrefix(`/web`)",
      ]

      check {
        type = "http"
        path = "/"
        interval = "10s"
        timeout  = "2s"
      }
    }

    task "web" {
      driver = "docker"

      env {
        HOST = "0.0.0.0"
        PORT = "${NOMAD_PORT_http}"
        API_URL = "https://api.brawltime.ninja"
        CLICKER_URL = "https://clicker.brawltime.ninja"
        CUBE_URL = "https://cube.brawltime.ninja"
        MEDIA_URL = "https://media.brawltime.ninja"
        RENDER_URL = "https://render.brawltime.ninja"
        // SENTRY_DSN = ""
      }

      config {
        image = "ghcr.io/schneefux/brawltime-web:latest"
        ports = ["http"]
      }

      resources {
        cpu = 200
        memory = 200
      }
    }
  }

  group "api" {
    network {
      port "http" {}
    }

    service {
      name = "brawltime-api"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-api.rule=PathPrefix(`/api`)",
      ]

      check {
        type = "http"
        path = "/api/status"
        interval = "10s"
        timeout = "2s"
      }
    }

    task "api" {
      driver = "docker"

      env {
        CLICKER_URL = "https://clicker.brawltime.ninja"
        PORT = "${NOMAD_PORT_http}"
      }

      template {
        data = <<EOF
          BRAWLSTARS_TOKEN=${var.brawlstars_token}
          BRAWLAPI_TOKEN=${var.brawlapi_token}
        EOF
        destination = "local/api.env"
        env = true
      }

      config {
        image = "ghcr.io/schneefux/brawltime-api:latest"
        ports = ["http"]
      }

      resources {
        cpu = 100
        memory = 100
      }
    }
  }

  group "clicker" {
    network {
      port "http" {}
    }

    service {
      name = "brawltime-clicker"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-clicker.rule=PathPrefix(`/clicker`)",
      ]

      check {
        type = "http"
        path = "/clicker/status"
        interval = "10s"
        timeout = "2s"
      }
    }

    task "clicker" {
      driver = "docker"

      env {
        PORT = "${NOMAD_PORT_http}"
        CLICKHOUSE_HOST = "clickhouse.service.consul"
      }

      config {
        image = "ghcr.io/schneefux/brawltime-clicker:latest"
        ports = ["http"]
      }

      resources {
        cpu = 100
        memory = 100
      }
    }
  }

  group "render" {
    network {
      port "http" {}
    }

    service {
      name = "brawltime-render"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-render.rule=PathPrefix(`/render`)",
      ]

      check {
        type = "http"
        path = "/status"
        interval = "10s"
        timeout = "2s"
      }
    }

    task "render" {
      driver = "docker"

      env {
        PORT = "${NOMAD_PORT_http}"
        WEB_URL = "https://brawltime.ninja"
      }

      config {
        image = "ghcr.io/schneefux/brawltime-render:latest"
        ports = ["http"]
      }

      resources {
        cpu = 100
        memory = 100
      }
    }
  }
}
