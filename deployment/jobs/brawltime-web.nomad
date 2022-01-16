variable "sentry_dsn" {}

# git hash or "latest"
variable "tag" {}

variable "domain" {
  default = "brawltime.ninja"
}

job "brawltime-web" {
  datacenters = ["dc1"]

  affinity {
    attribute = "${node.class}"
    operator = "regexp"
    value = "worker"
  }

  update {
    max_parallel = 1
    canary = 1
    min_healthy_time = "10s"
    healthy_deadline = "5m"
    auto_revert = true
    auto_promote = true
  }

  group "web" {
    count = 2

    scaling {
      enabled = true
      min = 1
      max = 4
    }

    network {
      port "http" {}
    }

    service {
      name = "brawltime-web"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-web.rule=Host(`${var.domain}`)",
        "traefik.http.routers.brawltime-web-www.rule=Host(`www.${var.domain}`)",
      ]

      check {
        type = "http"
        path = "/"
        interval = "10s"
        timeout  = "5s"

        check_restart {
          limit = 5
        }
      }
    }

    task "web" {
      driver = "docker"

      env {
        HOST = "0.0.0.0"
        PORT = "${NOMAD_PORT_http}"
        API_URL = "https://api.${var.domain}"
        CLICKER_URL = "https://clicker.${var.domain}"
        CUBE_URL = "https://cube.${var.domain}"
        MEDIA_URL = "https://media.${var.domain}"
        RENDER_URL = "https://render.${var.domain}"
        SENTRY_DSN = "${var.sentry_dsn}"
      }

      config {
        image = "ghcr.io/schneefux/brawltime-web:${var.tag}"
        ports = ["http"]
        dns_servers = ["${attr.unique.network.ip-address}"]
      }

      resources {
        cpu = 2048
        memory = 256
        memory_max = 512
      }
    }
  }
}
