job "ingress" {
  datacenters = ["dc1"]
  type = "system"

  update {
    max_parallel = 1
  }

  group "nginx" {
    volume "certs" {
      type = "host"
      source = "certs"
    }

    network {
      port "nginx" {
        static = 80
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

    volume "certs" {
      type = "host"
      read_only = true
      source = "certs"
    }

    task "nginx" {
      driver = "docker"

      config {
        image = "nginx:1.21-alpine"
        network_mode = "host"

        ulimit {
          nofile = "262144:262144"
        }

        # TODO generate dhparams
        volumes = [
          "./local/nginx.conf:/etc/nginx/nginx.conf:ro",
        ]
      }

      volume_mount {
        volume = "certs"
        read_only = true
        destination = "/etc/letsencrypt"
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
  }

  group "traefik" {
    count = 1

    network {
      port "traefik_http" {
        static = 8088
      }

      port "traefik_dashboard" {
        static = 8080
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
