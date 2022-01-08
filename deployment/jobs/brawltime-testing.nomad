variable "domain" {
  default = "brawltime.ninja"
}

variable "web_traduora_client_id" {}
variable "web_traduora_secret" {}
variable "web_traduora_project_id" {}

job "brawltime-testing" {
  datacenters = ["dc1"]

  constraint {
    attribute = "${node.class}"
    operator = "regexp"
    value = "worker|ingress"
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

    task "testing-web" {
      driver = "docker"

      env {
        HOST = "0.0.0.0"
        PORT = "${NOMAD_PORT_http}"
        API_URL = "https://api.${var.domain}"
        CLICKER_URL = "https://clicker.${var.domain}"
        CUBE_URL = "https://cube.${var.domain}"
        MEDIA_URL = "https://media.${var.domain}"
        RENDER_URL = "https://render.${var.domain}"
        TRADUORA_URL = "https://translate.${var.domain}"
        TRADUORA_CLIENT_ID = "${var.web_traduora_client_id}"
        TRADUORA_SECRET = "${var.web_traduora_secret}"
        TRADUORA_PROJECT_ID = "${var.web_traduora_project_id}"
      }

      config {
        image = "ghcr.io/schneefux/brawltime-web:latest"
        ports = ["http"]
        dns_servers = ["${attr.unique.network.ip-address}"]
      }

      resources {
        cpu = 256
        memory = 256
        memory_max = 512
      }
    }
  }
}
