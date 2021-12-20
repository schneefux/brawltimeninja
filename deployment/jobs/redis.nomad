job "redis" {
  datacenters = ["dc1"]

  affinity {
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

        volumes = [
          "local/redis.conf:/usr/local/etc/redis/redis.conf:ro",
        ]

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

      template {
        data = <<-EOF
          port {{ env "NOMAD_PORT_db" }}
          bind {{ env "NOMAD_IP_db" }}
          maxmemory {{ env "NOMAD_MEMORY_LIMIT" }}mb
          maxmemory-policy allkeys-lru
        EOF
        destination = "local/redis.conf"
        change_mode = "signal"
        change_signal = "SIGHUP"
      }

      resources {
        cpu = 512
        memory = 384
        memory_max = 512
      }
    }
  }
}
