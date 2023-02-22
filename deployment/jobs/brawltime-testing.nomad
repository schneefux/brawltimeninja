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

  constraint {
    attribute = "${node.class}"
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

    task "create-api-token" {
      lifecycle {
        hook = "prestart"
      }

      driver = "exec"

      # dynamically register token for current allocation and public IP address
      config {
        command = "/bin/bash"
        args = ["-e", "${NOMAD_TASK_DIR}/create_apikey.sh"]
      }

      template {
        data = <<-EOF
          EMAIL="${var.brawlstars_email}"
          PASSWORD="${var.brawlstars_password}"
        EOF
        destination = "secrets/credentials.env"
        env = true
      }

      template {
        data = file("./bin/create_apikey.sh")
        destination = "local/create_apikey.sh"
      }

      resources {
        cpu = 16
        memory = 32
      }
    }

    task "web" {
      driver = "docker"

      env {
        HOST = "0.0.0.0"
        PORT = "${NOMAD_PORT_http}"
        NODE_ENVIRONMENT = "production"
        NODE_OPTIONS = "--max-old-space-size=${NOMAD_MEMORY_MAX_LIMIT}"

        CUBE_URL = "https://cube.${var.domain}"
        MEDIA_URL = "https://media.${var.domain}"
        MANAGER_URL = "https://manager.${var.domain}"
        RENDER_URL = "https://render.${var.domain}"
        CLICKHOUSE_HOST = "clickhouse.service.consul"

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
          BRAWLSTARS_TOKEN="{{ key (printf "brawlstars-token/alloc-%s" (env "NOMAD_ALLOC_ID")) }}"
          BRAWLAPI_TOKEN="${var.brawlapi_token}"
        EOF
        destination = "secrets/brawlstars.env"
        env = true
      }

      config {
        image = "ghcr.io/schneefux/brawltime-web:latest"
        ports = ["http"]
        dns_servers = ["${attr.unique.network.ip-address}"]

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
