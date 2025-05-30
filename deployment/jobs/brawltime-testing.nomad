variable "web_traduora_client_id" {}
variable "web_traduora_secret" {}
variable "web_traduora_project_id" {}
variable "github_user" {}
variable "github_token" {}
variable "brawlapi_token" {}
variable "hpdevfox_token" {}
variable "cubejs_secret" {}

# git hash or "latest"
variable "tag" {
  default = "b650a4e0057992899a1f5be0a42f13d61e18a53a"
}

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

    task "web" {
      driver = "docker"

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

      env {
        HOST = "0.0.0.0"
        PORT = "${NOMAD_PORT_http}"
        NODE_ENVIRONMENT = "production"
        NODE_OPTIONS = "--max-old-space-size=${NOMAD_MEMORY_MAX_LIMIT}"

        BRAWLSTARS_URL = "http://proxy.${var.domain}/v1/"
        ENABLE_EXTRA_API = "true"
        MEDIA_URL = "https://media.${var.domain}"
        MANAGER_URL = "https://manager.${var.domain}"
        RENDER_URL = "https://render.${var.domain}"
        MYSQL_DATABASE = "brawltime"
        MYSQL_USER = "brawltime"
        MYSQL_PASSWORD = "brawltime"
        TRACKING_EXPIRE_AFTER_DAYS = "14"
        TRACKING_REFRESH_MINUTES = "1440"

        TRADUORA_URL = "https://translate.${var.domain}"
        TRADUORA_CLIENT_ID = "${var.web_traduora_client_id}"
        TRADUORA_SECRET = "${var.web_traduora_secret}"
        TRADUORA_PROJECT_ID = "${var.web_traduora_project_id}"

        #QUANTCAST_CHOICE_ID = "Zj670A0xwScEY"
        VENATUS_SITE_ID = "65e870e95daddd2733903a31"
      }

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
        memory_max = 768
      }
    }
  }
}
