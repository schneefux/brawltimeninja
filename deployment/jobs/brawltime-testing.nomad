variable "domain" {
  default = "brawltime.ninja"
}

job "brawltime-testing" {
  datacenters = ["dc1"]

  constraint {
    attribute = "${node.class}"
    operator = "regexp"
    value = "worker"
  }

  group "testing" {
    network {
      port "http" {}
    }

    service {
      name = "brawltime-testing"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-testing.rule=Host(`testing.${var.domain}`)",
      ]

      check {
        type = "http"
        path = "/"
        interval = "10s"
        timeout  = "5s"
      }
    }

    task "web" {
      driver = "docker"

      env {
        HOST = "0.0.0.0"
        PORT = "${NOMAD_PORT_http}"
        API_URL = "https://api.${var.domain}"
        CLICKER_URL = "https://clicker.${var.domain}"
        CUBE_URL = "https://cube.${var.domain}"
        MEDIA_URL = "https://media.${var.domain}"
        RENDER_URL = "https://render.${var.domain}"
      }

      config {
        image = "ghcr.io/schneefux/brawltime-web:latest"
        ports = ["http"]
        dns_servers = ["${attr.unique.network.ip-address}"]
      }

      resources {
        cpu = 1536
        memory = 256
        memory_max = 512
      }
    }
  }
}
