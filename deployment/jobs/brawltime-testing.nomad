variable "web_traduora_client_id" {}
variable "web_traduora_secret" {}
variable "web_traduora_project_id" {}
variable "github_user" {}
variable "github_token" {}
variable "brawlstars_email" {}
variable "brawlstars_password" {}
variable "brawlapi_token" {}

variable "domain" {
  default = "brawltime.ninja"
}

job "brawltime-testing" {
  datacenters = ["dc1"]

  priority = 1

  constraint {
    attribute = "${node.class}"
    value = "worker"
  }

  group "testing" {
    network {
      port "http" {}
    }

    restart {
      mode = "delay"
      interval = "5m"
    }

    service {
      name = "brawltime-testing"
      provider = "nomad"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-testing.rule=Host(`testing.${var.domain}`)",
      ]

      check {
        type = "http"
        path = "/"
        interval = "10s"
        timeout = "10s"

        check_restart {
          limit = 6
        }
      }
    }

    task "web" {
      driver = "docker"

      env {
        HOST = "0.0.0.0"
        PORT = "${NOMAD_PORT_http}"
        NODE_ENVIRONMENT = "production"
        NODE_OPTIONS = "--max-old-space-size=${NOMAD_MEMORY_MAX_LIMIT}"

        BRAWLSTARS_URL = "http://proxy.${var.domain}/v1/"
        CUBE_URL = "https://cube.${var.domain}"
        MEDIA_URL = "https://media.${var.domain}"
        MANAGER_URL = "https://manager.${var.domain}"
        RENDER_URL = "https://render.${var.domain}"

        TRADUORA_URL = "https://translate.${var.domain}"
        TRADUORA_CLIENT_ID = "${var.web_traduora_client_id}"
        TRADUORA_SECRET = "${var.web_traduora_secret}"
        TRADUORA_PROJECT_ID = "${var.web_traduora_project_id}"

        ADSENSE_PUBID = "ca-pub-6856963757796636"
        QUANTCAST_CHOICE_ID = "Zj670A0xwScEY"
        GA4_ID = "G-8GGHZC6QR2"
        UA_ID = "UA-137233906-1"
        OPTIMIZE_ID = "OPT-PWZ78LC"
        PLAYWIRE_RAMP_PUBLISHER_ID = "1024864"
        PLAYWIRE_RAMP_SITE_ID = "74021"
        PLAYWIRE_RAMP_GA4_ID = "G-YBE993Z5SQ"
      }

      template {
        data = <<-EOF
          BRAWLAPI_TOKEN="${var.brawlapi_token}"
        EOF
        destination = "secrets/brawlstars.env"
        env = true
      }

      config {
        image = "ghcr.io/schneefux/brawltime-web:latest"
        ports = ["http"]
        extra_hosts = [
          "${var.domain}:10.0.0.2",
          "cube.${var.domain}:10.0.0.2",
          "media.${var.domain}:10.0.0.2",
          "manager.${var.domain}:10.0.0.2",
          "render.${var.domain}:10.0.0.2",
          "proxy.${var.domain}:10.0.0.2",
          "translate.${var.domain}:10.0.0.2"
        ]

        auth {
          username = "${var.github_user}"
          password = "${var.github_token}"
        }
      }

      resources {
        cpu = 128
        memory = 512
        memory_max = 1536
      }
    }
  }
}
