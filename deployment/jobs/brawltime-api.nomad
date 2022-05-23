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

  constraint {
    attribute = "${node.class}"
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
      # max number of API keys: 8
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

    task "create-api-token" {
      lifecycle {
        hook = "prestart"
      }

      driver = "exec"

      # dynamically register token for current allocation and public IP address
      config {
        command = "/bin/bash"
        args = ["-e", "${NOMAD_TASK_DIR}/create_apikey.sh"]
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
        data = file("./bin/create_apikey.sh")
        destination = "local/create_apikey.sh"
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

      # revoke token
      config {
        command = "/bin/bash"
        args = ["-e", "${NOMAD_TASK_DIR}/delete_apikey.sh"]
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
        data = file("./bin/delete_apikey.sh")
        destination = "local/delete_apikey.sh"
      }

      resources {
        cpu = 16
        memory = 32
      }
    }

    task "api" {
      driver = "docker"

      env {
        CLICKHOUSE_HOST = "clickhouse.service.consul"
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
        cpu = 128
        memory = 384
        memory_max = 512
      }
    }
  }
}
