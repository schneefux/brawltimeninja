variable "domain" {
  default = "brawltime.ninja"
}

job "victorialogs" {
  datacenters = ["dc1"]

  constraint {
    attribute = "${node.class}"
    value = "database"
  }

  affinity {
    attribute = "${attr.unique.hostname}"
    value = "brawltime-hank"
  }

  priority = 80

  group "victorialogs" {
    stop_after_client_disconnect = "15m" # free up volume if disconnected from Nomad for a long time

    network {
      port "http" {
        static = 9428
      }
    }

/*
    volume "victorialogs-volume" {
      type = "csi"
      source = "victorialogs-database"
      attachment_mode = "file-system"
      access_mode = "single-node-writer"
    }
*/

    ephemeral_disk {
      migrate = true
      size = 2048
    }

    task "victorialogs" {
      driver = "docker"

      service {
        name = "victorialogs"
        provider = "nomad"
        port = "http"

        tags = [
          "traefik.enable=true",
          "traefik.http.routers.logs.rule=Host(`logs.${var.domain}`)",
          "traefik.http.routers.logs.middlewares=auth",
        ]

        check {
          type = "http"
          path = "/"
          interval = "10s"
          timeout = "2s"

          check_restart {
            limit = 6
          }
        }
      }

/*
      volume_mount {
        volume = "victorialogs-volume"
        destination = "/victoria-logs-data"
      }
*/

      config {
        image = "victoriametrics/victoria-logs:v1.23.3-victorialogs"

        args = [
          "-storageDataPath=${NOMAD_ALLOC_DIR}/data",
        ]

        ports = ["http"]
      }

      resources {
        cpu = 256
        memory = 512
        memory_max = 2048
      }
    }
  }
}
