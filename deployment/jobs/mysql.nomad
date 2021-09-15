job "traduora" {
  datacenters = ["dc1"]

  group "mysql" {
    network {
      port "db" {
        static = 3306
      }
    }

    volume "mysql-volume" {
      type = "csi"
      source = "traduora-database"
    }

    service {
      port = "db"

      check {
        type     = "tcp"
        interval = "10s"
        timeout  = "2s"
      }
    }

    task "mysql" {
      driver = "docker"

      volume_mount {
        volume = "mysql-volume"
        destination = "/srv"
      }

      env {
        MYSQL_DATABASE = "traduora"
        MYSQL_USER = "tr"
        MYSQL_PASSWORD = "change_me"
        MYSQL_ROOT_PASSWORD = "root"
        MYSQL_ALLOW_EMPTY_PASSWORD = 1
      }

      config {
        image = "mysql:5.7"
        args = ["--datadir", "/srv/mysql"]
        ports = ["db"]
      }

      resources {
        cpu = 500
        memory = 1024
      }
    }
  }
}
