job "cubestore" {
  datacenters = ["dc1"]

  affinity {
    attribute = "${node.class}"
    value = "database"
  }

  // TODO is cubestore needed at all? there are no pre-aggregations
  group "cubestore" {
    network {
      port "http" {
        // TODO route cubestore via traefik
        static = 3030
      }

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
          limit = 5
        }
      }
    }

    task "router" {
      driver = "docker"

      env {
        CUBESTORE_STATUS_PORT = "${NOMAD_PORT_status}"
        CUBESTORE_META_PORT = "${NOMAD_PORT_router}"
        CUBESTORE_PORT = "${NOMAD_PORT_db}"
        // TODO set CUBEJS_CUBESTORE_PORT for API instance
        // and refresh worker to remove static port?
        CUBESTORE_HTTP_PORT = "${NOMAD_PORT_http}"
      }

      config {
        image = "cubejs/cubestore:v0.28"
        ports = ["http", "router", "status"]
        volumes = [
          "cubestore:/cube/data",
        ]
      }

      resources {
        cpu = 64
        memory = 512
        memory_max = 1024
      }
    }

    // no workers because there are no pre-aggregations
  }
}
