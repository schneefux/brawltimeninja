variable "sentry_dsn" {}
variable "github_user" {}
variable "github_token" {}
variable "brawlapi_token" {}
variable "hpdevfox_token" {}
variable "openai_key" {}
variable "cubejs_secret" {}

# git hash or "latest"
variable "tag" {}

variable "domain" {
  default = "brawltime.ninja"
}

job "brawltime-web" {
  datacenters = ["dc1"]

  priority = 60

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
    count = 7 # autoscaling is currently broken due to https://github.com/hashicorp/nomad/issues/24339

    restart {
      mode = "delay"
      interval = "5m"
    }

    scaling {
      enabled = true
      min = 7 # note: keep at least 1 backup in case the other fails
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
            upper_bound = 20
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
      provider = "nomad"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-web.rule=Host(`${var.domain}`)",
        "traefik.http.routers.brawltime-web-www.rule=Host(`www.${var.domain}`)",
      ]
      canary_tags = [
        # do not route via traefik
        "canary=true",
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

        #QUANTCAST_CHOICE_ID = "Zj670A0xwScEY" # disabled in favor of Venatus Google CMP
        VENATUS_SITE_ID = "65e870e95daddd2733903a31"
        GA4_ID = "G-G5V3FPZG9Z"
        #ENEBA_ID = "BrawlTimeNinja"
      }

      # FIXME containers do not respect host's DNS settings
      # https://github.com/hashicorp/nomad/issues/12894

      # web can run without clickhouse, cube and mysql
      # -> set CLICKHOUSE_URL/MYSQL only when they are available
      # -> set CUBE_URL only when a router and CH are available (as cube depends on CH)
      template {
        data = <<-EOF
          {{ $clickhouse_servers := nomadService "clickhouse" }}
          {{ with $clickhouse_servers }}
            CLICKHOUSE_URL = "http://{{ with index . 0 }}{{ .Address }}:{{ .Port }}{{ end }}"
          {{ end }}
          {{ $cube_servers := nomadService "brawltime-cube" }}
          {{ $cube_online := false }}
          {{- range $cube_servers }}
            {{- if not (contains .Tags "canary")}}
              {{- $cube_online = true}}
            {{- end}}
          {{- end}}
          {{ if and ($clickhouse_servers) ($cube_online) }}
            CUBE_URL = "https://cube.${var.domain}"
          {{ end }}
          {{ with nomadService "mariadb" }}
            MYSQL_HOST = "{{ with index . 0 }}{{ .Address }}{{ end }}"
            MYSQL_PORT = "{{ with index . 0 }}{{ .Port }}{{ end }}"
          {{ end }}
        EOF
        destination = "local/db.env"
        env = true
        splay = "1m" # wait random amount of time to prevent all instances restarting at the same time
        # wait for the cluster to be consistent
        wait {
          min = "10s"
          max = "1m"
        }
      }

      template {
        data = <<-EOF
          BRAWLAPI_TOKEN="${var.brawlapi_token}"
          HPDEVFOX_TOKEN="${var.hpdevfox_token}"
          OPENAI_API_KEY="${var.openai_key}"
          CUBEJS_API_SECRET="${var.cubejs_secret}"
        EOF
        destination = "secrets/tokens.env"
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
        cpu = 1536
        memory = 768
        memory_max = 1024
      }
    }
  }
}
