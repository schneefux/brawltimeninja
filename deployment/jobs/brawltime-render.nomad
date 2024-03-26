variable "github_user" {}
variable "github_token" {}

# git hash or "latest"
variable "tag" {}

variable "domain" {
  default = "brawltime.ninja"
}

job "brawltime-render" {
  datacenters = ["dc1"]

  priority = 10

  constraint {
    attribute = "${node.class}"
    operator = "regexp"
    value = "worker"
  }

  update {
    auto_revert = true
    auto_promote = true
    canary = 1
  }

  group "render" {
    count = 1

    restart {
      mode = "delay"
      interval = "5m"
    }

    scaling {
      enabled = true
      min = 1
      max = 16

      policy {
        check "high_cpu" {
          source = "nomad-apm"
          group = "cpu-allocated"
          query = "avg_cpu-allocated"
          query_window = "10m"

          strategy "threshold" {
            upper_bound = 100
            lower_bound = 80
            within_bounds_trigger = 1
            delta = 1
          }
        }

        check "low_cpu" {
          source = "nomad-apm"
          group = "cpu-allocated"
          query = "avg_cpu-allocated"
          query_window = "10m"

          strategy "threshold" {
            upper_bound = 40
            lower_bound = 0
            within_bounds_trigger = 1
            delta = -1
          }
        }
      }
    }

    network {
      port "http" {}
    }

    service {
      name = "brawltime-render"
      provider = "nomad"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-render.rule=Host(`render.${var.domain}`)",
      ]

      check {
        type = "http"
        path = "/status"
        interval = "10s"
        timeout = "2s"

        check_restart {
          limit = 6
        }
      }
    }

    task "render" {
      driver = "docker"

      env {
        PORT = "${NOMAD_PORT_http}"
        WEB_URL = "https://${var.domain}"
        DD_AGENT_HOST = "${attr.unique.network.ip-address}"
        NODE_OPTIONS = "--max-old-space-size=${NOMAD_MEMORY_MAX_LIMIT}"
      }

      // TODO set up seccomp profile
      // https://playwright.dev/docs/docker#crawling-and-scraping
      config {
        image = "ghcr.io/schneefux/brawltime-render:${var.tag}"
        ipc_mode = "host"
        ports = ["http"]

        auth {
          username = "${var.github_user}"
          password = "${var.github_token}"
        }
      }

      resources {
        cpu = 128
        memory = 384
        memory_max = 512
      }
    }
  }
}
