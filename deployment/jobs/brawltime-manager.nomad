variable "manager_secret" {}
variable "manager_google_oauth" {}

# git hash or "latest"
variable "tag" {}

variable "domain" {
  default = "brawltime.ninja"
}

job "brawltime-manager" {
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

  group "manager" {
    count = 2

    scaling {
      enabled = true
      min = 1
      max = 8
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
        NODE_CONFIG_DIR = "/local/config"
        NODE_CONIFG_ENV = "production"
      }

      template {
        data = <<-EOF
        {
          "host": "{{ env "NOMAD_HOST_http" }}",
          "port": {{ env "NOMAD_PORT_http" }},
          "database": {
            "client": "mysql2",
            "connection": {
              "host": "{{ range service "mariadb" }}{{ .Address }}{{ end }}",
              "port": {{ range service "mariadb" }}{{ .Port }}{{ end }},
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
              "redirect": "https://${var.domain}/account",
              "google": ${var.manager_google_oauth}
            }
          }
        }
        EOF
        destination = "local/config/production.json"
      }

      config {
        image = "ghcr.io/schneefux/brawltime-manager:${var.tag}"
        ports = ["http"]
        dns_servers = ["${attr.unique.network.ip-address}"]
      }

      resources {
        cpu = 128
        memory = 128
        memory_max = 256
      }
    }
  }
}
