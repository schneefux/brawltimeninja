variable "domain" {
  default = "brawltime.ninja"
}

variable "basic_auth" {}

job "traefik" {
  datacenters = ["dc1"]

  priority = 100

  constraint {
    attribute = "${node.class}"
    value = "ingress"
  }

  # TODO zero-downtime-deployment
  # problem: port 80 can't be used twice

  group "traefik" {
    network {
      port "traefik_http" {
        static = 8088
      }

      port "traefik_ssh" {
        static = 2222
      }
    }

    task "traefik" {
      driver = "docker"

      restart {
        mode = "delay"
        interval = "30s"
      }

      service {
        name = "traefik"
        provider = "nomad"
        port = "traefik_http"

        check {
          type = "tcp"
          interval = "5s"
          timeout = "2s"

          check_restart {
            limit = 12
          }
        }

        # 4646: default Nomad port
        tags = [
          "traefik.enable=true",
          "traefik.http.middlewares.auth.basicauth.users=${var.basic_auth}",

          "traefik.http.routers.traefik-dashboard.rule=Host(`traefik.${var.domain}`)",
          "traefik.http.routers.traefik-dashboard.service=api@internal",
          "traefik.http.routers.traefik-dashboard.middlewares=auth",

          "traefik.http.services.nomad-dashboard.loadbalancer.server.port=4646",
          "traefik.http.routers.nomad-dashboard.rule=Host(`nomad.${var.domain}`)",
          "traefik.http.routers.nomad-dashboard.service=nomad-dashboard",
          "traefik.http.routers.nomad-dashboard.middlewares=auth",

          # default to 503
          "traefik.http.services.unavailable.loadbalancer.server.port=0",
          "traefik.http.routers.catchall.rule=PathPrefix(`/`)",
          "traefik.http.routers.catchall.service=unavailable",
          "traefik.http.routers.catchall.priority=1",
        ]
      }

      # TODO datadog does not receive anything?
      env {
        HOST_IP = "${attr.unique.network.ip-address}"
      }

      config {
        image = "traefik:v3.2"
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
        cpu = 1536
        memory = 512
        memory_max = 1536
      }
    }
  }
}
