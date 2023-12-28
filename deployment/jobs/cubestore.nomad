job "cubestore" {
  datacenters = ["dc1"]

  constraint {
    attribute = "${node.class}"
    value = "database"
  }

  priority = 80

  group "cubestore" {
    network {
      port "http" {}

      port "db" {}

      port "router" {}

      port "status" {}
    }

    service {
      name = "cubestore"
      port = "http"

      check {
        type = "http"
        port = "status"
        path = "/readyz"
        interval = "10s"
        timeout = "2s"

        check_restart {
          limit = 6
        }
      }
    }

    task "router" {
      driver = "docker"

      env {
        CUBESTORE_SERVER_NAME = "${NOMAD_ADDR_http}"
        CUBESTORE_META_PORT = "${NOMAD_PORT_router}"
        CUBESTORE_WORKERS = "" # no preaggregations - no workers needed
        CUBESTORE_PORT = "${NOMAD_PORT_db}"
        CUBESTORE_HTTP_PORT = "${NOMAD_PORT_http}"
        CUBESTORE_STATUS_PORT = "${NOMAD_PORT_status}"
        CUBESTORE_LOG_LEVEL = "info"
      }

      config {
        # FIXME there is a memory leak in the rate limiter https://github.com/cube-js/cube/issues/7545
        image = "cubejs/cubestore:v0.34.0"
        ports = ["http", "db", "router", "status"]
        volumes = [
          "cubestore:/cube/data",
        ]
      }

      resources {
        #cpu = 1024 # avg 390 with peaks up to ~2.3k
        cpu = 2048
        memory = 3072
        memory_max = 3584
      }
    }
  }
}
