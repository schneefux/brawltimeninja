# git hash or "latest"
variable "tag" {}

variable "domain" {
  default = "brawltime.ninja"
}

job "brawltime-clicker" {
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

  group "clicker" {
    count = 1

    scaling {
      enabled = true
      min = 1
      max = 4

      policy {
        check "high_cpu" {
          source = "nomad-apm"
          group = "cpu-allocated"
          query = "avg_cpu-allocated"
          query_window = "10m"

          strategy "threshold" {
            upper_bound = 100
            lower_bound = 80
            delta = 1
          }
        }

        check "low_cpu" {
          source = "nomad-apm"
          group = "cpu-allocated"
          query = "avg_cpu-allocated"
          query_window = "10m"

          strategy "threshold" {
            upper_bound = 20
            lower_bound = 0
            delta = -1
          }
        }
      }
    }

    constraint {
      attribute = "${node.class}"
      operator = "regexp"
      value = "worker|database"
    }

    network {
      port "http" {}
    }

    service {
      name = "brawltime-clicker"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-clicker.rule=Host(`clicker.${var.domain}`)",
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
        DD_AGENT_HOST = "${attr.unique.network.ip-address}"
      }

      config {
        image = "ghcr.io/schneefux/brawltime-clicker:${var.tag}"
        ports = ["http"]
        dns_servers = ["${attr.unique.network.ip-address}"]
      }

      resources {
        cpu = 32
        memory = 64
        memory_max = 128
      }
    }
  }
}
