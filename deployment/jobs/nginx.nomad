variable "brawlstars_token1" {}
variable "brawlstars_token2" {}

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

    ephemeral_disk {
      migrate = true
      size = 16000 # MB for logs and nginx cache
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
        BRAWLSTARS_TOKEN1="${var.brawlstars_token1}"
        BRAWLSTARS_TOKEN2="${var.brawlstars_token2}"
      }

      logs {
        # 100 * 10MB - written to ephemeral_disk
        max_files = 100
        max_file_size = 10
      }

      config {
        image = "nginx:1.27-alpine"
        network_mode = "host"

        ulimit {
          nofile = "262144:262144"
        }

        # TODO generate dhparams
        volumes = [
          "local/nginx.conf:/etc/nginx/nginx.conf:ro",
        ]

        # to generate a goaccess report:
        /*
cat *.stdout.* | fgrep -v "^10.0.0." | LANG="en_US.UTF-8" goaccess - \
  --time-format='%H:%M:%S' \
  --date-format='%d/%b/%Y' \
  --log-format='%h %^ %e [%d:%t %z] "%r" %s %b "%R" "%u" %C' -o report.html
        */

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
        cpu = 1024
        memory = 768
        memory_max = 1280
      }
    }
  }
}
