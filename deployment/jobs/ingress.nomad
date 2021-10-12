job "ingress" {
  datacenters = ["dc1"]

  constraint {
    attribute = "${node.class}"
    value = "ingress"
  }

  # TODO zero-downtime-deployment
  # problem: port 80 can't be used twice

  group "nginx" {
    volume "certs" {
      type = "host"
      source = "certs"
    }

    network {
      port "nginx_http" {
        static = 80
      }

      port "nginx_https" {
        static = 443
      }

      port "status" {}
    }

    service {
      name = "nginx"
      port = "nginx_http"

      check {
        type = "tcp"
        interval = "10s"
        timeout = "2s"
      }
    }

    service {
      name = "nginx-ssl"
      port = "nginx_https"

      check {
        type = "tcp"
        interval = "10s"
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
      }

      config {
        image = "nginx:1.21-alpine"
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
        change_mode = "signal"
        change_signal = "SIGHUP"
      }

      resources {
        # average cpu: 196
        cpu = 512
        memory = 96
        memory_max = 512
      }
    }
  }

  group "traefik" {
    network {
      port "traefik_http" {
        static = 8088
      }

      port "traefik_dashboard" {
        static = 8080
      }

      port "traefik_ssh" {
        static = 2222
      }
    }

    service {
      name = "traefik"
      port = "traefik_http"

      check {
        type = "tcp"
        interval = "10s"
        timeout = "2s"
      }
    }

    task "traefik" {
      driver = "docker"

      # TODO datadog does not receive anything?
      env {
        HOST_IP = "${attr.unique.network.ip-address}"
      }

      config {
        image = "traefik:v2.5"
        network_mode = "host"

        volumes = [
          "local/traefik.toml:/etc/traefik/traefik.toml:ro",
        ]
      }

      template {
        data = file("./conf/traefik.toml.tpl")
        destination = "local/traefik.toml"
        # traefik watches the config automatically
        change_mode = "noop"
      }

      resources {
        # average cpu: 96
        cpu = 256
        memory = 64
        memory_max = 384
      }
    }
  }
}
