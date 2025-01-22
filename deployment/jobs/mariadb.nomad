job "mariadb" {
  datacenters = ["dc1"]

  priority = 60

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
      provider = "nomad"
      port = "db"

      check {
        type = "tcp"
        interval = "10s"
        timeout = "2s"
      }

      check_restart {
        limit = 6
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
        MARIADB_AUTO_UPGRADE = 1
      }

      config {
        image = "mariadb:11.6"
        args = ["--datadir", "/srv/mariadb"]
        ports = ["db"]
      }

      resources {
        # without survey
        #cpu = 512 # typically 150
        #memory = 512
        #memory_max = 1024

        # with survey
        cpu = 1024
        memory = 1024
        memory_max = 2048
      }
    }
  }
}
