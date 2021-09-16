job "ingress" {
  datacenters = ["dc1"]

  # Cloudflare points to leader
  constraint {
    attribute = "${attr.unique.network.ip-address}"
    value = "10.0.0.2"
  }

  group "ingress" {
    count = 1

    network {
      port "nginx" {
        static = 80
      }

      port "traefik_http" {
        static = 8088
      }

      port "traefik_dashboard" {
        static = 8080
      }
    }

    service {
      name = "nginx"
      port = "nginx"

      check {
        name = "alive"
        type = "tcp"
        interval = "10s"
        timeout = "2s"
      }
    }

    service {
      name = "traefik"
      port = "traefik_http"

      check {
        name = "alive"
        type = "tcp"
        interval = "10s"
        timeout = "2s"
      }
    }

    task "nginx" {
      driver = "docker"

      config {
        image = "nginx:1.21-alpine"
        network_mode = "host"

        volumes = [
          "./local/nginx.conf:/etc/nginx/nginx.conf:ro",
        ]

        ulimit {
          nofile = "262144:262144"
        }
      }

      template {
        data = file("./conf/nginx.conf.tpl")
        destination = "local/nginx.conf"
      }

      resources {
        cpu = 32
        memory = 64
      }
    }

    task "traefik" {
      driver = "docker"

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
      }

      resources {
        cpu = 16
        memory = 64
      }
    }
  }
}
