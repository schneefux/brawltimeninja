variable "s3_bucket_clickhouse_backup" {}
variable "s3_access_key" {}
variable "s3_secret" {}

job "clickhouse-backup" {
  datacenters = ["dc1"]
  type = "batch"
  priority = 10

  periodic {
    crons = ["0 0 * * *"]  # daily at midnight
    prohibit_overlap = true
  }

  constraint {
    attribute = "${node.class}"
    value = "worker"
  }

  group "clickhouse-backup" {
    task "cron" {
      restart {
        attempts = 0
        mode = "fail"
      }

      driver = "docker"

      template {
        data = <<-EOF
          {{ $clickhouse_servers := nomadService "clickhouse-native" }}
          {{ with $clickhouse_servers }}
            CLICKHOUSE_HOST = "{{ with index . 0 }}{{ .Address }}{{ end }}"
            CLICKHOUSE_NATIVE_PORT = "{{ with index . 0 }}{{ .Port }}{{ end }}"
          {{ end }}
        EOF
        destination = "local/db.env"
        env = true
      }

      template {
        data = <<-EOH
          set -e
          echo "Starting ClickHouse backup..."

          if [ $(date +%d) = '01' ]; then
            echo "Performing full backup..."
            # full backup
            clickhouse-client \
              --host $CLICKHOUSE_HOST \
              --port $CLICKHOUSE_NATIVE_PORT \
              --query "BACKUP DATABASE brawltime TO S3('${var.s3_bucket_clickhouse_backup}/$(date +%Y-%m-%d).zip', '${var.s3_access_key}', '${var.s3_secret}')"
            echo "Full backup completed successfully"
          else
            echo "Performing incremental backup..."
            YESTERDAY=$(date -d @$(( $(/bin/date +%s ) - 86400 )) +%Y-%m-%d)
            echo "Using base backup from: $YESTERDAY"

            clickhouse-client \
              --host $CLICKHOUSE_HOST \
              --port $CLICKHOUSE_NATIVE_PORT \
              --query "BACKUP DATABASE brawltime TO S3('${var.s3_bucket_clickhouse_backup}/$(date +%Y-%m-%d).zip', '${var.s3_access_key}', '${var.s3_secret}') \
                      SETTINGS base_backup = S3('${var.s3_bucket_clickhouse_backup}/$YESTERDAY.zip', '${var.s3_access_key}', '${var.s3_secret}')"
            echo "Incremental backup completed successfully"
          fi

          echo "Backup process finished"
        EOH
        destination = "local/backup.sh"
        perms = "0755"
      }

      config {
        image = "clickhouse/clickhouse-server:25.4-alpine"
        entrypoint = ["/bin/sh", "-c"]
        command = "$NOMAD_TASK_DIR/backup.sh"
      }

      resources {
        cpu = 64
        memory = 128
        memory_max = 512
      }
    }
  }
}
