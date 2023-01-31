variable "github_user" {}
variable "github_token" {}

# git hash or "latest"
variable "tag" {}

variable "domain" {
  default = "brawltime.ninja"
}

job "brawltime-cube" {
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

  group "cube" {
    count = 3

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
            upper_bound = 20
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
      # TODO unfortunately, this also caches error pages and continue-wait
        /*
        "traefik.http.routers.brawltime-cube.middlewares=brawltime-cube-cache@consulcatalog",
        "traefik.http.middlewares.brawltime-cube-cache.headers.customresponseheaders.Cache-Control=public, max-age=300",
        */

      check {
        type = "http"
        path = "/livez"
        interval = "10s"
        timeout = "2s"

        check_restart {
          limit = 5
        }
      }
    }

    task "cube" {
      driver = "docker"

      env {
        PORT = "${NOMAD_PORT_http}"
        CUBEJS_DB_HOST = "clickhouse.service.consul"
        CUBEJS_REDIS_URL = "redis://redis.service.consul"
        CUBEJS_CUBESTORE_HOST = "cubestore.service.consul"
        NODE_OPTIONS = "--max-old-space-size=${NOMAD_MEMORY_LIMIT}"
      }

      config {
        image = "ghcr.io/schneefux/brawltime-cube:${var.tag}"
        ports = ["http"]
        dns_servers = ["${attr.unique.network.ip-address}"]

        auth {
          username = "${var.github_user}"
          password = "${var.github_token}"
        }
      }

      resources {
        cpu = 768
        memory = 384
        memory_max = 768
      }
    }
  }

  group "cube_refresh" {
    count = 1

    scaling {
      enabled = true
      min = 1
      max = 4

      policy {
        check "high_cpu" {
          source = "nomad-apm"
          group = "cpu-allocated-refresh"
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
          group = "cpu-allocated-refresh"
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

    affinity {
      attribute = "${node.class}"
      operator = "regexp"
      value = "worker|database"
    }

    task "refresh" {
      driver = "docker"

      env {
        CUBEJS_DB_HOST = "clickhouse.service.consul"
        CUBEJS_REDIS_URL = "redis://redis.service.consul:6379"
        CUBEJS_CUBESTORE_HOST = "cubestore.service.consul"
        CUBEJS_REFRESH_WORKER = true
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
        memory = 196
        memory_max = 256
      }
    }
  }
}
