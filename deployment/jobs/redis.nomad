job "redis" {
  datacenters = ["dc1"]

  group "redis" {
    network {
      port "db" {
        static = 6379
      }
    }

    service {
      name = "redis"
      port = "db"
      check {
        type = "tcp"
        interval = "10s"
        timeout = "2s"
      }
    }

    task "redis" {
      driver = "docker"

      config {
        image = "redis:6.2-alpine"
        args = ["--port", "${NOMAD_PORT_db}"]
        ports = ["db"]
      }

      resources {
        cpu = 100
        memory = 256
      }
    }
  }
}
