job "clickhouse" {
  datacenters = ["dc1"]

  constraint {
    attribute = "${node.class}"
    value = "database"
  }

  affinity {
    attribute = "${attr.unique.hostname}"
    value = "brawltime-pam"
  }

  priority = 100 # move all other services to get this one running!

  group "clickhouse" {
    stop_after_client_disconnect = "15m" # free up volume if disconnected from Nomad for a long time

    network {
      port "http" {
        static = 8123
      }

      port "tcp" {
        static = 9000
      }

      port "mysql" {
        static = 9004
      }

      port "postgresql" {
        static = 9005
      }

      port "interserver" {
        static = 9009
      }
    }

    volume "clickhouse-volume" {
      type = "csi"
      source = "clickhouse-database"
      attachment_mode = "file-system"
      access_mode = "single-node-writer"
    }

    task "clickhouse" {
      driver = "docker"

      service {
        name = "clickhouse"
        provider = "nomad"
        port = "http"

        check {
          type = "http"
          path = "/ping"
          interval = "10s"
          timeout = "2s"

          check_restart {
            limit = 6
          }
        }
      }

      service {
        name = "clickhouse-native"
        provider = "nomad"
        port = "tcp"
      }

      env {
        DATA_PATH = "/srv/clickhouse/"
        TMP_PATH = "/var/lib/clickhouse/tmp/"
      }

      volume_mount {
        volume = "clickhouse-volume"
        destination = "/srv"
      }

      config {
        image = "clickhouse/clickhouse-server:25.6-alpine"
        network_mode = "host"

        volumes = [
          "local/clickhouse.xml:/etc/clickhouse-server/config.d/config.xml:ro",
          "local/clickhouse-users.xml:/etc/clickhouse-server/users.d/users.xml:ro",
        ]

        ports = ["http", "tcp", "mysql", "postgresql", "interserver"]

        ulimit {
          nofile = "262144:262144"
        }
        cap_add = ["sys_nice", "net_admin", "ipc_lock"]

        labels = {
          "com.datadoghq.ad.check_names" = jsonencode(["clickhouse"])
          "com.datadoghq.ad.init_configs" = jsonencode([{}])
          "com.datadoghq.ad.instances" = jsonencode([{
            server = "${NOMAD_IP_tcp}",
          }])
        }
      }

      template {
        data = file("./conf/clickhouse/clickhouse.xml.tpl")
        destination = "local/clickhouse.xml"
      }

      template {
        data = file("./conf/clickhouse/clickhouse-users.xml.tpl")
        destination = "local/clickhouse-users.xml"
      }

      resources {
        cpu = 28000 # typically 6-15k, will peak up to max capacity
        memory = 29000 # requires 8GB for queries, rest is caching
        memory_max = 29500
      }
    }
  }
}
