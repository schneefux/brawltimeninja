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

    task "router" {
      driver = "docker"

      service {
        name = "cubestore"
        provider = "nomad"
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

      env {
        IMAGE = "${IMAGE}"
        CUBESTORE_SERVER_NAME = "${NOMAD_ADDR_http}"
        CUBESTORE_META_PORT = "${NOMAD_PORT_router}"
        CUBESTORE_WORKERS = "" # no preaggregations - no workers needed
        CUBESTORE_PORT = "${NOMAD_PORT_db}"
        CUBESTORE_HTTP_PORT = "${NOMAD_PORT_http}"
        CUBESTORE_STATUS_PORT = "${NOMAD_PORT_status}"
        CUBESTORE_LOG_LEVEL = "info"
      }

      template {
        data = <<-EOF
          TAG_VARIANT={{ if eq (env "attr.cpu.arch") "arm64" }}-arm64v8{{ else }}{{ end }}
        EOF
        destination = "local/tag.env"
        env = true
      }

      config {
        image = "cubejs/cubestore:v1.3${TAG_VARIANT}"
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
