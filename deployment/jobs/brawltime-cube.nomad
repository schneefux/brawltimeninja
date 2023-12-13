variable "github_user" {}
variable "github_token" {}

# git hash or "latest"
variable "tag" {}

variable "domain" {
  default = "brawltime.ninja"
}

job "brawltime-cube" {
  datacenters = ["dc1"]

  priority = 40

  constraint {
    attribute = "${node.class}"
    value = "worker"
  }

  update {
    auto_revert = true
    auto_promote = true
    canary = 1
  }

  group "cube" {
    count = 2

    restart {
      mode = "delay"
      interval = "5m"
    }

    scaling {
      enabled = true
      min = 2
      max = 16

      policy {
        check "high_cpu" {
          source = "nomad-apm"
          group = "cpu-allocated-cube"
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
          group = "cpu-allocated-cube"
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

    affinity {
      attribute = "${node.class}"
      operator = "regexp"
      value = "worker|database"
    }

    network {
      port "http" {}
    }

    service {
      name = "brawltime-cube"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-cube.rule=Host(`cube.${var.domain}`)",
      ]

      check {
        type = "http"
        path = "/livez"
        interval = "10s"
        timeout = "2s"

        check_restart {
          limit = 6
        }
      }
    }

    task "cube" {
      driver = "docker"

      env {
        PORT = "${NOMAD_PORT_http}"
        NODE_OPTIONS = "--max-old-space-size=${NOMAD_MEMORY_MAX_LIMIT}"
        # increase number of connections to clickhouse
        CUBEJS_CONCURRENCY = "100"
        CUBEJS_DB_MAX_POOL = "512"
        CUBEJS_LOG_LEVEL = "info"
        CUBEJS_DB_QUERY_TIMEOUT = "2m"
      }

      # FIXME container does not use host's DNS setting
      template {
        data = <<-EOF
          {{ with service "clickhouse" }}
            CUBEJS_DB_HOST = "{{ with index . 0 }}{{ .Address }}{{ end }}"
          {{ end }}
          {{ with service "cubestore" }}
            CUBEJS_CUBESTORE_HOST = "{{ with index . 0 }}{{ .Address }}{{ end }}"
            CUBEJS_CUBESTORE_PORT = "{{ with index . 0 }}{{ .Port }}{{ end }}"
          {{ end }}
        EOF
        destination = "secrets/db.env"
        env = true
      }

      config {
        image = "ghcr.io/schneefux/brawltime-cube:${var.tag}"
        ports = ["http"]

        auth {
          username = "${var.github_user}"
          password = "${var.github_token}"
        }
      }

      resources {
        cpu = 512
        memory = 384
        memory_max = 768
      }
    }
  }

  group "cube_refresh" {
    count = 1

    affinity {
      attribute = "${node.class}"
      operator = "regexp"
      value = "worker|database"
    }

    restart {
      mode = "delay"
      interval = "5m"
    }

    task "refresh" {
      driver = "docker"

      env {
        CUBEJS_REFRESH_WORKER = true
        NODE_OPTIONS = "--max-old-space-size=${NOMAD_MEMORY_MAX_LIMIT}"
        # increase number of connections to clickhouse
        CUBEJS_CONCURRENCY = "50"
        CUBEJS_DB_MAX_POOL = "128"
        CUBEJS_LOG_LEVEL = "info"
        CUBEJS_DB_QUERY_TIMEOUT = "2m"
      }

      # FIXME container does not use host's DNS setting
      template {
        data = <<-EOF
          {{ with service "clickhouse" }}
            CUBEJS_DB_HOST = "{{ with index . 0 }}{{ .Address }}{{ end }}"
          {{ end }}
          {{ with service "cubestore" }}
            CUBEJS_CUBESTORE_HOST = "{{ with index . 0 }}{{ .Address }}{{ end }}"
            CUBEJS_CUBESTORE_PORT = "{{ with index . 0 }}{{ .Port }}{{ end }}"
          {{ end }}
        EOF
        destination = "secrets/db.env"
        env = true
      }

      config {
        image = "ghcr.io/schneefux/brawltime-cube:${var.tag}"
        dns_servers = ["${attr.unique.network.ip-address}"]

        auth {
          username = "${var.github_user}"
          password = "${var.github_token}"
        }
      }

      resources {
        cpu = 32
        memory = 192
        memory_max = 384
      }
    }
  }
}
