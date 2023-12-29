variable "brawlstars_token" {}

job "nginx" {
  datacenters = ["dc1"]

  priority = 100

  constraint {
    attribute = "${node.class}"
    value = "ingress"
  }

  # TODO zero-downtime-deployment
  # problem: port 80 can't be used twice

  group "nginx" {
    network {
      port "nginx_http" {
        static = 80
      }

      port "nginx_https" {
        static = 443
      }

      port "status" {}
    }

    restart {
      mode = "delay"
      interval = "30s"
    }

    service {
      name = "nginx"
      provider = "nomad"
      port = "nginx_http"

      check {
        type = "tcp"
        interval = "5s"
        timeout = "2s"
      }

      check_restart {
        limit = 12
      }
    }

    service {
      name = "nginx-ssl"
      provider = "nomad"
      port = "nginx_https"

      check {
        type = "tcp"
        interval = "5s"
        timeout = "2s"
      }
    }

    volume "certs" {
      type = "host"
      read_only = true
      source = "certs"
    }

    task "nginx" {
      driver = "docker"

      env {
        SSL_PATH = "/etc/letsencrypt/live/brawltime.ninja"
        BRAWLSTARS_TOKEN="${var.brawlstars_token}"
      }

      config {
        image = "nginx:1.25-alpine"
        network_mode = "host"

        ulimit {
          nofile = "262144:262144"
        }

        # TODO generate dhparams
        volumes = [
          "local/nginx.conf:/etc/nginx/nginx.conf:ro",
        ]

        ports = ["nginx_http", "nginx_https", "status"]

        labels = {
          "com.datadoghq.ad.check_names" = jsonencode(["nginx"])
          "com.datadoghq.ad.init_configs" = jsonencode([{}])
          "com.datadoghq.ad.instances" = jsonencode([{
            nginx_status_url = "http://${NOMAD_ADDR_status}/nginx_status",
          }])
        }
      }

      volume_mount {
        volume = "certs"
        read_only = true
        destination = "/etc/letsencrypt"
      }

      template {
        data = file("./conf/nginx.conf.tpl")
        destination = "local/nginx.conf"
        # FIXME use restart because when traefik briefly goes down,
        # the upstream never recovers because the config is never applied
        # (maybe because when receiving SIGHUP, nginx waits for all connections to close first, which never happens?)

        #change_mode = "signal"
        #change_signal = "SIGHUP"
        # wait for the cluster to be consistent
        wait {
          min = "10s"
          max = "5m"
        }
      }

      resources {
        cpu = 1536
        memory = 512
        memory_max = 1024
      }
    }
  }
}
