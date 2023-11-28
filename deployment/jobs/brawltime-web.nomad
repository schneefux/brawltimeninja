variable "sentry_dsn" {}
variable "github_user" {}
variable "github_token" {}
variable "brawlapi_token" {}

# git hash or "latest"
variable "tag" {}

variable "domain" {
  default = "brawltime.ninja"
}

job "brawltime-web" {
  datacenters = ["dc1"]

  constraint {
    attribute = "${node.class}"
    value = "worker"
  }

  update {
    auto_revert = true
    auto_promote = true
    canary = 1
  }

  group "web" {
    count = 4

    restart {
      mode = "delay"
      interval = "5m"
    }

    scaling {
      enabled = true
      min = 2 # 1 backup in case the other fails
      max = 16

      policy {
        check "high_cpu" {
          source = "nomad-apm"
          group = "cpu-allocated"
          query = "avg_cpu-allocated"
          query_window = "10m"

          strategy "threshold" {
            upper_bound = 100
            lower_bound = 80
            within_bounds_trigger = 1
            delta = 1
          }
        }

        check "low_cpu" {
          source = "nomad-apm"
          group = "cpu-allocated"
          query = "avg_cpu-allocated"
          query_window = "10m"

          strategy "threshold" {
            upper_bound = 40
            lower_bound = 0
            within_bounds_trigger = 1
            delta = -1
          }
        }
      }
    }

    network {
      port "http" {}
    }

    service {
      name = "brawltime-web"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-web.rule=Host(`${var.domain}`)",
        "traefik.http.routers.brawltime-web-www.rule=Host(`www.${var.domain}`)",
      ]

      check {
        type = "http"
        path = "/health"
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
        MYSQL_DATABASE = "brawltime"
        MYSQL_USER = "brawltime"
        MYSQL_PASSWORD = "brawltime"
        TRACKING_EXPIRE_AFTER_DAYS = "14"
        TRACKING_REFRESH_MINUTES = "1440"

        SENTRY_DSN = "${var.sentry_dsn}"
        DD_AGENT_HOST = "${attr.unique.network.ip-address}"

        ADSENSE_PUBID = "ca-pub-6856963757796636"
        QUANTCAST_CHOICE_ID = "Zj670A0xwScEY"
        GA4_ID = "G-8GGHZC6QR2"
        UA_ID = "UA-137233906-1"
        OPTIMIZE_ID = "OPT-PWZ78LC"
        PLAYWIRE_RAMP_PUBLISHER_ID = "1024864"
        PLAYWIRE_RAMP_SITE_ID = "74021"
        PLAYWIRE_RAMP_GA4_ID = "G-YBE993Z5SQ"
      }

      # FIXME containers do not respect host's DNS settings
      # https://github.com/hashicorp/nomad/issues/12894
      template {
        data = <<-EOF
          {{ with service "clickhouse" }}
            CLICKHOUSE_HOST = "{{ with index . 0 }}{{ .Address }}{{ end }}"
          {{ end }}
          {{ with service "mariadb" }}
            MYSQL_HOST = "{{ with index . 0 }}{{ .Address }}{{ end }}"
          {{ end }}
        EOF
        destination = "secrets/db.env"
        env = true
      }

      template {
        data = <<-EOF
          BRAWLAPI_TOKEN="${var.brawlapi_token}"
        EOF
        destination = "secrets/brawlstars.env"
        env = true
      }

      config {
        image = "ghcr.io/schneefux/brawltime-web:${var.tag}"
        ports = ["http"]
        extra_hosts = [
          "${var.domain}:10.0.0.2",
          "cube.${var.domain}:10.0.0.2",
          "media.${var.domain}:10.0.0.2",
          "manager.${var.domain}:10.0.0.2",
          "render.${var.domain}:10.0.0.2",
          "proxy.${var.domain}:10.0.0.2"
        ]

        auth {
          username = "${var.github_user}"
          password = "${var.github_token}"
        }
      }

      resources {
        cpu = 796
        memory = 512
        memory_max = 1536
      }
    }
  }
}
