job "redis" {
  datacenters = ["dc1"]

  constraint {
    attribute = "${node.class}"
    value = "database"
  }

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
        labels = {
          "com.datadoghq.ad.check_names" = jsonencode(["redisdb"])
          "com.datadoghq.ad.init_configs" = jsonencode([{}])
          "com.datadoghq.ad.instances" = jsonencode([{
            host = "${NOMAD_IP_db}",
            port = "${NOMAD_PORT_db}",
          }])
        }
      }

      resources {
        cpu = 64
        memory = 128
      }
    }
  }
}
