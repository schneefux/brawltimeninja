job "vector" {
  datacenters = ["dc1"]
  type = "system"

  update {
    auto_revert = true
    auto_promote = true
    canary = 1
  }

  group "vector" {
    ephemeral_disk {
      migrate = true
      size = 300
    }

    network {
      port "http" {}
    }

    task "vector" {
      driver = "docker"

      config {
        image = "timberio/vector:0.47.X-alpine"

        ports = ["http"]

        volumes = [
          "/proc:/host/proc:ro",
          "/sys:/host/sys:ro",
          "/var/run/docker.sock:/host/var/run/docker.sock:ro",
        ]
      }

      service {
        name = "vector"
        provider = "nomad"
        port = "http"

        check {
          type = "http"
          path = "/health"
          interval = "10s"
          timeout = "2s"

          check_restart {
            limit = 6
          }
        }
      }

      env {
        VECTOR_CONFIG = "local/config/vector.toml"
      }

      template {
        data = <<-EOF
          data_dir                     = "{{ env "NOMAD_ALLOC_DIR" }}/data/vector/"
          healthchecks.require_healthy = true

          [api]
            enabled              = true
            address              = "0.0.0.0:{{ env "NOMAD_PORT_http" }}"
            playground           = false

          [sources.docker_logs]
            type                 = "docker_logs"
            docker_host          = "/host/var/run/docker.sock"
            exclude_containers   = ["vector-"]

          [transforms.remove_empty]
            type                 = "filter"
            inputs              = ["docker_logs"]
            condition           = ".message != \"\""

          [transforms.parse_json]
            type                 = "remap"
            inputs              = ["remove_empty"]
            source = """
            structured = parse_nginx_log(.message, "error") ??
              parse_json(.message) ??
              {}
            . = merge!(., structured)
            """

          [sinks.vlogs]
            type                 = "http"
            inputs               = [ "parse_json" ]
            {{ with nomadService "victorialogs" }}
            uri                  = "http://{{ with index . 0 }}{{ .Address }}:{{ .Port }}{{ end }}/insert/jsonline?_stream_fields=label.com.hashicorp.nomad.job_id,label.com.hashicorp.nomad.task_group_name,label.com.hashicorp.nomad.task_name,label.com.hashicorp.nomad.alloc_id&_msg_field=message&_time_field=timestamp&ignore_fields=label.com.datadoghq.*,label.maintainer"
            {{ end }}
            compression          = "gzip"
            encoding.codec       = "json"
            framing.method       = "newline_delimited"
            healthcheck.enabled  = false
        EOF
        change_mode = "signal"
        change_signal = "SIGHUP"
        destination = "local/config/vector.toml"
      }

      resources {
        cpu = 64
        memory = 64
      }
    }
  }
}
