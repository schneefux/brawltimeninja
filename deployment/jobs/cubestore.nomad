job "cubestore" {
  datacenters = ["dc1"]

  constraint {
    attribute = "${node.class}"
    value = "database"
  }

  priority = 80

  group "cubestore" {
    network {
      # TODO load balance multiple routers via traefik?
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
        path = "/livez"
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
        image = "cubejs/cubestore:v0.34"
        ports = ["http", "db", "router", "status"]
        volumes = [
          "cubestore:/cube/data",
        ]
      }

      resources {
        cpu = 2048 # mean 768 but peaks up to 4k
        memory = 2048
        memory_max = 3072
      }
    }
  }
}
