variable "brawlstars_token" {}
variable "brawlapi_token" {}

locals {
  root_domain = "staging.brawltime.ninja"
  domain = "-staging.brawltime.ninja"
}

job "brawltime" {
  datacenters = ["dc1"]

  update {
    max_parallel = 1
  }

  group "web" {
    network {
      port "http" {}
    }

    service {
      name = "brawltime-web"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-web.rule=Host(`${local.root_domain}`)",
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
        API_URL = "https://api${local.domain}"
        CLICKER_URL = "https://clicker${local.domain}"
        CUBE_URL = "https://cube${local.domain}"
        MEDIA_URL = "https://media${local.domain}"
        RENDER_URL = "https://render${local.domain}"
        // SENTRY_DSN = ""
      }

      config {
        image = "ghcr.io/schneefux/brawltime-web:latest"
        ports = ["http"]
      }

      resources {
        cpu = 200
        memory = 400
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
        "traefik.http.routers.brawltime-api.rule=Host(`api${local.domain}`)",
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
        CLICKER_URL = "https://clicker${local.domain}"
        PORT = "${NOMAD_PORT_http}"
        BRAWLSTARS_TOKEN = "${var.brawlstars_token}"
        BRAWLAPI_TOKEN = "${var.brawlapi_token}"
        # TODO get a new token - tokens are secured by IP
      }

      config {
        image = "ghcr.io/schneefux/brawltime-api:latest"
        ports = ["http"]
      }

      resources {
        cpu = 100
        memory = 128
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
        "traefik.http.routers.brawltime-clicker.rule=Host(`clicker${local.domain}`)",
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
        memory = 128
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
        "traefik.http.routers.brawltime-render.rule=Host(`render${local.domain}`)",
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
        WEB_URL = "https://${local.root_domain}"
      }

      config {
        image = "ghcr.io/schneefux/brawltime-render:latest"
        ports = ["http"]
      }

      resources {
        cpu = 100
        memory = 256
      }
    }
  }

  group "cube" {
    network {
      port "http" {}
    }

    service {
      name = "brawltime-cube"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-cube.rule=Host(`cube${local.domain}`)",
      ]

      check {
        type = "http"
        path = "/livez"
        interval = "10s"
        timeout = "2s"
      }
    }

    task "cube" {
      driver = "docker"

      env {
        PORT = "${NOMAD_PORT_http}"
        CUBEJS_DB_HOST = "clickhouse.service.consul"
        CUBEJS_REDIS_URL = "redis://redis.service.consul:6379"
        CUBEJS_CUBESTORE_HOST = "cubestore.service.consul"
      }

      config {
        image = "ghcr.io/schneefux/brawltime-cube:latest"
        ports = ["http"]
      }

      resources {
        cpu = 100
        memory = 128
      }
    }
  }

  group "cube_refresh" {
    task "refresh" {
      driver = "docker"

      env {
        CUBEJS_DB_HOST = "clickhouse.service.consul"
        CUBEJS_REDIS_URL = "redis://redis.service.consul:6379"
        CUBEJS_CUBESTORE_HOST = "cubestore.service.consul"
        CUBEJS_REFRESH_WORKER = true
      }

      config {
        image = "ghcr.io/schneefux/brawltime-cube:latest"
      }

      resources {
        cpu = 100
        memory = 128
      }
    }
  }

  # TODO media group
}
