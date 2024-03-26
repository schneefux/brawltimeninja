variable "sentry_dsn" {}
variable "github_user" {}
variable "github_token" {}
variable "brawlapi_token" {}
variable "openai_key" {}

# git hash or "latest"
variable "tag" {}

variable "domain" {
  default = "brawltime.ninja"
}

job "brawltime-cron" {
  datacenters = ["dc1"]
  type = "batch"

  priority = 10

  periodic {
    cron = "*/5 * * * *"
    prohibit_overlap = true
  }

  constraint {
    attribute = "${node.class}"
    value = "worker"
  }

  group "brawltime-cron" {
    task "cron" {
      driver = "docker"

      env {
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
        TRACKING_REFRESH_PARALLEL = "25"

        SENTRY_DSN = "${var.sentry_dsn}"
        DD_AGENT_HOST = "${attr.unique.network.ip-address}"
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
          OPENAI_API_KEY="${var.openai_key}"
        EOF
        destination = "secrets/tokens.env"
        env = true
      }

      config {
        image = "ghcr.io/schneefux/brawltime-web:${var.tag}"
        entrypoint = ["node"]
        command = "./node_modules/.bin/tsx"
        args = ["./api/cli.ts", "update-profiles"]
        init = true

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
        cpu = 512
        memory = 512
        memory_max = 768
      }
    }
  }
}
