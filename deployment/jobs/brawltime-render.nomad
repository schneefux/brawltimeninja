# git hash or "latest"
variable "tag" {}

variable "domain" {
  default = "brawltime.ninja"
}

job "brawltime-render" {
  datacenters = ["dc1"]

  constraint {
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

  group "render" {
    scaling {
      enabled = true
      min = 1
      max = 8
    }

    network {
      port "http" {}
    }

    service {
      name = "brawltime-render"
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
      }

      check_restart {
        limit = 5
      }
    }

    task "render" {
      driver = "docker"

      env {
        PORT = "${NOMAD_PORT_http}"
        WEB_URL = "https://${var.domain}"
        DD_AGENT_HOST = "${attr.unique.network.ip-address}"
      }

      // TODO set up seccomp profile
      // https://playwright.dev/docs/docker#crawling-and-scraping
      config {
        image = "ghcr.io/schneefux/brawltime-render:${var.tag}"
        ipc_mode = "host"
        ports = ["http"]
        dns_servers = ["${attr.unique.network.ip-address}"]
      }

      resources {
        cpu = 1024
        memory = 384
        memory_max = 512
      }
    }
  }
}
