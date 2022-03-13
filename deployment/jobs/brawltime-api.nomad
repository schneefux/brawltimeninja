variable "brawlstars_email" {}
variable "brawlstars_password" {}
variable "brawlapi_token" {}

# git hash or "latest"
variable "tag" {}

variable "domain" {
  default = "brawltime.ninja"
}

job "brawltime-api" {
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

  group "api" {
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

          strategy "threshold" {
            upper_bound = 20
            lower_bound = 0
            delta = -1
          }
        }
      }
    }

    network {
      port "http" {}
    }

    service {
      name = "brawltime-api"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-api.rule=Host(`api.${var.domain}`)",
      ]

      check {
        type = "http"
        path = "/api/status"
        interval = "10s"
        timeout = "2s"

        check_restart {
          limit = 5
        }
      }
    }

    task "get-api-token" {
      lifecycle {
        hook = "prestart"
      }

      driver = "exec"

      # dynamically register token for current public IP address
      config {
        command = "/bin/bash"
        args = ["-e", "${NOMAD_TASK_DIR}/update_apikey.sh"]
      }

      template {
        data = <<-EOF
          EMAIL="${var.brawlstars_email}"
          PASSWORD="${var.brawlstars_password}"
        EOF
        destination = "secrets/credentials.env"
        env = true
      }

      template {
        data = file("./bin/update_apikey.sh")
        destination = "local/update_apikey.sh"
      }

      resources {
        cpu = 16
        memory = 32
      }
    }

    task "delete-api-token" {
      lifecycle {
        hook = "poststop"
      }

      driver = "exec"

      config {
        command = "consul"
        args = ["kv", "delete", "brawlstars-token/alloc-${NOMAD_ALLOC_ID}"]
      }

      resources {
        cpu = 16
        memory = 32
      }
    }

    task "api" {
      driver = "docker"

      env {
        CLICKER_URL = "https://clicker.${var.domain}/clicker"
        PORT = "${NOMAD_PORT_http}"
        DD_AGENT_HOST = "${attr.unique.network.ip-address}"
      }

      template {
        data = <<-EOF
          BRAWLSTARS_TOKEN="{{ key (printf "brawlstars-token/alloc-%s" (env "NOMAD_ALLOC_ID")) }}"
          BRAWLAPI_TOKEN="${var.brawlapi_token}"
        EOF
        destination = "secrets/brawlstars.env"
        env = true
      }

      config {
        image = "ghcr.io/schneefux/brawltime-api:${var.tag}"
        ports = ["http"]
        dns_servers = ["${attr.unique.network.ip-address}"]
      }

      resources {
        cpu = 256
        memory = 384
        memory_max = 512
      }
    }
  }
}
