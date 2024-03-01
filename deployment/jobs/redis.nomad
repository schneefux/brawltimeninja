job "redis" {
  datacenters = ["dc1"]

  priority = 80

  group "redis" {
    constraint {
      attribute = "${node.class}"
      value = "database"
    }

    network {
      port "db" {
        static = 6379
      }
    }

    service {
      name = "redis"
      provider = "nomad"
      port = "db"

      check {
        type = "tcp"
        interval = "10s"
        timeout = "2s"
      }

      check_restart {
        limit = 5
      }
    }

    ephemeral_disk {
      migrate = true
      size = 2048
    }

    task "redis" {
      driver = "docker"

      config {
        image = "redis:7.2-alpine"
        args = [ "/usr/local/etc/redis/redis.conf" ]

        volumes = [
          "local/redis.conf:/usr/local/etc/redis/redis.conf:ro",
          "alloc/data:/data",
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
          dir {{ env "NOMAD_ALLOC_DIR" }}/data
          port {{ env "NOMAD_PORT_db" }}
          maxmemory {{ env "NOMAD_MEMORY_LIMIT" }}mb
          maxmemory-policy allkeys-lru
          stop-writes-on-bgsave-error no
        EOF
        # when memory is low, bgsave fails -> don't throw error
        destination = "local/redis.conf"
        change_mode = "signal"
        change_signal = "SIGHUP"
      }

      resources {
        # reserve 3-4x to handle spikes
        cpu = 1024 # typically 192
        memory = 2560 # typically 768-2048
        memory_max = 2816
      }
    }
  }
}
