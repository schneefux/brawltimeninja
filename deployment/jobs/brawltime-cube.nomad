variable "github_user" {}
variable "github_token" {}
variable "cubejs_secret" {}

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
    count = 3

    restart {
      mode = "delay"
      interval = "5m"
    }

    scaling {
      enabled = true
      min = 3
      max = 16

      policy {
        check "high_cpu" {
          # scale up as soon as all workers are currently busy with a long-running query
          source = "nomad-apm"
          group = "cpu-allocated-cube"
          query = "min_cpu-allocated"

          strategy "threshold" {
            upper_bound = 100
            lower_bound = 60
            within_bounds_trigger = 1
            delta = 1
          }
        }

        check "low_cpu" {
          # scale down when all workers are idle
          source = "nomad-apm"
          group = "cpu-allocated-cube"
          query = "max_cpu-allocated"

          strategy "threshold" {
            upper_bound = 40
            lower_bound = 0
            within_bounds_trigger = 1
            delta = -1
          }
        }
      }
    }

    constraint {
      attribute = "${node.class}"
      operator = "regexp"
      value = "worker"
    }

    network {
      port "http" {}
    }

    service {
      name = "brawltime-cube"
      provider = "nomad"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-cube.rule=Host(`cube.${var.domain}`)",
        # prevent thundering herd by limiting the total number of in flight requests to approx. clickhouse's concurrent query limit
        "traefik.http.middlewares.brawltime-cube-inflightreq.inflightreq.amount=128"
      ]
      canary_tags = [
        # do not route via traefik
        "canary=true",
      ]

      check {
        type = "http"
        path = "/readyz"
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
        CUBEJS_CONCURRENCY = "20"
        CUBEJS_DB_MAX_POOL = "128"
        CUBEJS_LOG_LEVEL = "info"
        CUBEJS_DB_QUERY_TIMEOUT = "2m"
      }

      template {
        data = <<-EOF
          CUBEJS_API_SECRET="${var.cubejs_secret}"
        EOF
        destination = "secrets/cubejs.env"
        env = true
      }

      template {
        data = <<-EOF
          {{ with nomadService "clickhouse" }}
            CUBEJS_DB_HOST = "{{ with index . 0 }}{{ .Address }}{{ end }}"
          {{ end }}
          {{ with nomadService "cubestore" }}
            CUBEJS_CUBESTORE_HOST = "{{ with index . 0 }}{{ .Address }}{{ end }}"
            CUBEJS_CUBESTORE_PORT = "{{ with index . 0 }}{{ .Port }}{{ end }}"
          {{ end }}
        EOF
        destination = "local/db.env"
        env = true
        splay = "1m" # wait random amount of time to prevent all instances restarting at the same time
        # wait for the cluster to be consistent
        wait {
          min = "10s"
          max = "1m"
        }
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
        cpu = 1024 # typically 100-300
        memory = 512
        memory_max = 768
      }
    }
  }

  group "cube_refresh" {
    count = 1

    constraint {
      attribute = "${node.class}"
      operator = "regexp"
      value = "worker"
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
        CUBEJS_CONCURRENCY = "20"
        CUBEJS_DB_MAX_POOL = "128"
        CUBEJS_LOG_LEVEL = "info"
        CUBEJS_DB_QUERY_TIMEOUT = "2m"
      }

      template {
        data = <<-EOF
          {{ with nomadService "clickhouse" }}
            CUBEJS_DB_HOST = "{{ with index . 0 }}{{ .Address }}{{ end }}"
            CUBEJS_DB_PORT = "{{ with index . 0 }}{{ .Port }}{{ end }}"
          {{ end }}
          {{ with nomadService "cubestore" }}
            CUBEJS_CUBESTORE_HOST = "{{ with index . 0 }}{{ .Address }}{{ end }}"
            CUBEJS_CUBESTORE_PORT = "{{ with index . 0 }}{{ .Port }}{{ end }}"
          {{ end }}
        EOF
        destination = "local/db.env"
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
