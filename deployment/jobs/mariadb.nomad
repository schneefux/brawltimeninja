job "mariadb" {
  datacenters = ["dc1"]

  constraint {
    attribute = "${node.class}"
    value = "database"
  }

  group "mariadb" {
    stop_after_client_disconnect = "15m" # free up volume if disconnected from Nomad for a long time

    network {
      port "db" {
        static = 3306
      }
    }

    volume "mariadb-volume" {
      type = "csi"
      source = "mariadb-database"
      attachment_mode = "file-system"
      access_mode = "single-node-writer"
    }

    service {
      name = "mariadb"
      port = "db"

      check {
        type = "tcp"
        interval = "10s"
        timeout  = "2s"
      }

      check_restart {
        limit = 5
      }
    }

    task "mariadb" {
      driver = "docker"

      volume_mount {
        volume = "mariadb-volume"
        destination = "/srv"
      }

      env {
        MYSQL_ALLOW_EMPTY_PASSWORD = 1
        #MARIADB_AUTO_UPGRADE = 1
      }

      config {
        image = "mariadb:10.11"
        args = ["--datadir", "/srv/mariadb"]
        ports = ["db"]
      }

      resources {
        cpu = 128
        memory = 256
        memory_max = 512
      }
    }
  }
}
