# git hash or "latest"
variable "tag" {}

variable "domain" {
  default = "brawltime.ninja"
}

job "brawltime-cube" {
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

  group "cube" {
    scaling {
      enabled = true
      min = 1
      max = 8
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
      }
    }

    task "cube" {
      driver = "docker"

      env {
        PORT = "${NOMAD_PORT_http}"
        CUBEJS_DB_HOST = "clickhouse.service.consul"
        CUBEJS_REDIS_URL = "redis://redis.service.consul"
        CUBEJS_CUBESTORE_HOST = "cubestore.service.consul"
      }

      config {
        image = "ghcr.io/schneefux/brawltime-cube:${var.tag}"
        ports = ["http"]
        dns_servers = ["${attr.unique.network.ip-address}"]
      }

      resources {
        cpu = 1024
        memory = 196
        memory_max = 384
      }
    }
  }

  group "cube_refresh" {
    scaling {
      enabled = true
      min = 1
      max = 4
    }

    constraint {
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
      }

      resources {
        cpu = 64
        memory = 96
        memory_max = 128
      }
    }
  }
}
