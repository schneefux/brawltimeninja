variable "github_user" {}
variable "github_token" {}
variable "manager_secret" {}
variable "manager_google_oauth" {}

# git hash or "latest"
variable "tag" {}

variable "domain" {
  default = "brawltime.ninja"
}

job "brawltime-manager" {
  datacenters = ["dc1"]

  constraint {
    attribute = "${node.class}"
    value = "database"
  }

  update {
    max_parallel = 1
    canary = 1
    min_healthy_time = "10s"
    healthy_deadline = "5m"
    auto_revert = true
    auto_promote = true
  }

  group "manager" {
    count = 2

    scaling {
      enabled = true
      min = 1
      max = 8

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
            upper_bound = 20
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
      name = "brawltime-manager"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-manager.rule=Host(`manager.${var.domain}`)",
      ]

      check {
        type = "http"
        path = "/users"
        interval = "10s"
        timeout = "2s"

        check_restart {
          limit = 5
        }
      }
    }

    task "manager" {
      driver = "docker"

      env {
        NODE_CONFIG_DIR = "/secrets/config"
        NODE_CONIFG_ENV = "production"
        NODE_OPTIONS = "--max-old-space-size=${NOMAD_MEMORY_MAX_LIMIT}"
      }

      template {
        data = <<-EOF
        {
          "host": "{{ env "NOMAD_HOST_http" }}",
          "port": {{ env "NOMAD_PORT_http" }},
          "database": {
            "client": "mysql2",
            "connection": {
              "host": "{{ with service "mariadb" }}{{ with index . 0 }}{{ .Address }}{{ end }}{{ end }}",
              "port": {{ with service "mariadb" }}{{ with index . 0 }}{{ .Port }}{{ end }}{{ end }},
              "user": "brawltime_manager",
              "password": "brawltime_manager",
              "database": "brawltime_manager"
            }
          },
          "authentication": {
            "secret": "${var.manager_secret}",
            "entity": "user",
            "service": "users",
            "authStrategies": ["jwt", "oauth"],
            "oauth": {
              "defaults": {
                "origin": "https://manager.${var.domain}"
              },
              "redirect": "https://${var.domain}/account",
              "google": ${var.manager_google_oauth}
            }
          }
        }
        EOF
        destination = "secrets/config/production.json"
      }

      config {
        image = "ghcr.io/schneefux/brawltime-manager:${var.tag}"
        ports = ["http"]
        dns_servers = ["${attr.unique.network.ip-address}"]

        auth {
          username = "${var.github_user}"
          password = "${var.github_token}"
        }
      }

      resources {
        cpu = 64
        memory = 64
        memory_max = 256
      }
    }
  }
}
