variable "brawlstars_email" {}
variable "brawlstars_password" {}
variable "brawlapi_token" {}
variable "brawltime_assets_pubkey" {}
variable "brawltime_assets_hostkey_ed" {}
variable "brawltime_assets_hostkey_rsa" {}

locals {
  root_domain = "staging.brawltime.ninja"
  domain = "-staging.brawltime.ninja"
  # docker node default UID
  asset_uid = 1000
}

# TODO tag images using commit ID and use canary deployments

job "brawltime" {
  datacenters = ["dc1"]

  constraint {
    attribute = "${node.class}"
    value = "worker"
  }

  group "web" {
    network {
      port "http" {}
    }

    service {
      name = "brawltime-web"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-web.rule=Host(`${local.root_domain}`)",
        "traefik.http.routers.brawltime-web-www.rule=Host(`www${local.domain}`)",
      ]

      check {
        type = "http"
        path = "/"
        interval = "10s"
        timeout  = "2s"
      }
    }

    task "web" {
      driver = "docker"

      env {
        HOST = "0.0.0.0"
        PORT = "${NOMAD_PORT_http}"
        API_URL = "https://api${local.domain}"
        CLICKER_URL = "https://clicker${local.domain}"
        CUBE_URL = "https://cube${local.domain}"
        MEDIA_URL = "https://media${local.domain}"
        RENDER_URL = "https://render${local.domain}"
        // SENTRY_DSN = ""
      }

      config {
        image = "ghcr.io/schneefux/brawltime-web:latest"
        ports = ["http"]
        dns_servers = ["${attr.unique.network.ip-address}"]
      }

      resources {
        cpu = 2048
        memory = 256
      }
    }
  }

  group "api" {
    network {
      port "http" {}
    }

    service {
      name = "brawltime-api"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-api.rule=Host(`api${local.domain}`)",
      ]

      check {
        type = "http"
        path = "/api/status"
        interval = "10s"
        timeout = "2s"
      }
    }

    task "get-api-token" {
      lifecycle {
        hook = "prestart"
      }

      driver = "exec"

      # dynamically register token for current public IP address
      config {
        command = "/bin/bash"
        args = ["${NOMAD_TASK_DIR}/update_apikey.sh"]
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
        data = file("./bin/update_apikey.sh")
        destination = "local/update_apikey.sh"
      }
    }

    task "api" {
      driver = "docker"

      env {
        CLICKER_URL = "https://clicker${local.domain}/clicker"
        PORT = "${NOMAD_PORT_http}"
        DD_AGENT_HOST = "${attr.unique.network.ip-address}"
      }

      template {
        data = <<-EOF
          BRAWLSTARS_TOKEN="{{ key (printf "%s/token" (env "NOMAD_ALLOC_ID")) }}"
          BRAWLAPI_TOKEN="${var.brawlapi_token}"
        EOF
        destination = "secrets/brawlstars.env"
        env = true
      }

      config {
        image = "ghcr.io/schneefux/brawltime-api:latest"
        ports = ["http"]
        dns_servers = ["${attr.unique.network.ip-address}"]
      }

      resources {
        cpu = 64
        memory = 96
      }
    }
  }

  group "clicker" {
    network {
      port "http" {}
    }

    service {
      name = "brawltime-clicker"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-clicker.rule=Host(`clicker${local.domain}`)",
      ]

      check {
        type = "http"
        path = "/clicker/status"
        interval = "10s"
        timeout = "2s"
      }
    }

    task "clicker" {
      driver = "docker"

      env {
        PORT = "${NOMAD_PORT_http}"
        CLICKHOUSE_HOST = "clickhouse.service.consul"
        DD_AGENT_HOST = "${attr.unique.network.ip-address}"
      }

      config {
        image = "ghcr.io/schneefux/brawltime-clicker:latest"
        ports = ["http"]
        dns_servers = ["${attr.unique.network.ip-address}"]
      }

      resources {
        cpu = 192
        memory = 96
      }
    }
  }

  group "media" {
    network {
      port "http" {}
      port "ssh" {
        to = 22
      }
    }

    volume "brawltime-assets-volume" {
      type = "csi"
      source = "brawltime-assets"
      attachment_mode = "file-system"
      access_mode = "single-node-writer"
    }

    service {
      name = "brawltime-media"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-media.rule=Host(`media${local.domain}`)",
      ]

      check {
        type = "http"
        path = "/status"
        interval = "10s"
        timeout = "2s"
      }
    }

    task "media" {
      driver = "docker"

      volume_mount {
        volume = "brawltime-assets-volume"
        destination = "/assets/"
      }

      env {
        PORT = "${NOMAD_PORT_http}"
        ASSET_DIR = "/assets/"
        DD_AGENT_HOST = "${attr.unique.network.ip-address}"
      }

      config {
        image = "ghcr.io/schneefux/brawltime-media:latest"
        ports = ["http"]
        dns_servers = ["${attr.unique.network.ip-address}"]
      }

      resources {
        cpu = 128
        memory = 96
      }
    }

    task "update-assets-permissions" {
      # https://github.com/hashicorp/nomad/issues/8892
      lifecycle {
        hook = "prestart"
      }

      driver = "docker"

      volume_mount {
        volume = "brawltime-assets-volume"
        destination = "/mnt/assets"
      }

      config {
        image = "busybox:1"
        command = "sh"
        args = ["-c", "chown -R ${local.asset_uid} /mnt/assets/"]
      }

      resources {
        cpu = 16
        memory = 32
      }
    }

    service {
      name = "brawltime-media-sftp"
      port = "ssh"

      tags = [
        "traefik.enable=true",
        "traefik.tcp.routers.brawltime-media.entrypoints=ssh",
        "traefik.tcp.routers.brawltime-media.rule=HostSNI(`*`)",
        "traefik.tcp.routers.brawltime-media.service=brawltime-media-sftp",
        "traefik.tcp.services.brawltime-media-sftp.loadbalancer.server.port=${NOMAD_HOST_PORT_ssh}",
      ]

      check {
        type = "tcp"
        interval = "10s"
        timeout = "2s"
      }
    }

    task "sftp" {
      driver = "docker"

      volume_mount {
        volume = "brawltime-assets-volume"
        destination = "/home/brawlbot/brawlbot/assets"
      }

      config {
        image = "atmoz/sftp:alpine"
        args = ["brawlbot::${local.asset_uid}"]
        ports = ["ssh"]
        volumes = [
          "secrets/pubkey.pub:/home/brawlbot/.ssh/keys/id_rsa.pub:ro",
          "secrets/hostkey.ed:/etc/ssh/ssh_host_ed25519_key",
          "secrets/hostkey.rsa:/etc/ssh/ssh_host_rsa_key",
        ]
      }

      template {
        data = "${var.brawltime_assets_pubkey}"
        destination = "secrets/pubkey.pub"
      }

      template {
        data = "${var.brawltime_assets_hostkey_ed}"
        destination = "secrets/hostkey.ed"
      }

      template {
        data = "${var.brawltime_assets_hostkey_rsa}"
        destination = "secrets/hostkey.rsa"
      }

      resources {
        cpu = 16
        memory = 32
      }
    }
  }

  group "render" {
    network {
      port "http" {}
    }

    service {
      name = "brawltime-render"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-render.rule=Host(`render${local.domain}`)",
      ]

      check {
        type = "http"
        path = "/status"
        interval = "10s"
        timeout = "2s"
      }
    }

    task "render" {
      driver = "docker"

      env {
        PORT = "${NOMAD_PORT_http}"
        WEB_URL = "https://${local.root_domain}"
        DD_AGENT_HOST = "${attr.unique.network.ip-address}"
      }

      config {
        image = "ghcr.io/schneefux/brawltime-render:latest"
        ports = ["http"]
        dns_servers = ["${attr.unique.network.ip-address}"]
      }

      resources {
        cpu = 768
        memory = 1024
      }
    }
  }

  group "cube" {
    network {
      port "http" {}
    }

    service {
      name = "brawltime-cube"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.brawltime-cube.rule=Host(`cube${local.domain}`)",
      ]

      check {
        type = "http"
        path = "/livez"
        interval = "10s"
        timeout = "2s"
      }
    }

    task "cube" {
      driver = "docker"

      env {
        PORT = "${NOMAD_PORT_http}"
        CUBEJS_DB_HOST = "clickhouse.service.consul"
        CUBEJS_REDIS_URL = "redis://redis.service.consul"
        CUBEJS_CUBESTORE_HOST = "cubestore.service.consul"
      }

      config {
        image = "ghcr.io/schneefux/brawltime-cube:latest"
        ports = ["http"]
        dns_servers = ["${attr.unique.network.ip-address}"]
      }

      resources {
        cpu = 768
        memory = 192
      }
    }
  }

  group "cube_refresh" {
    task "refresh" {
      driver = "docker"

      env {
        CUBEJS_DB_HOST = "clickhouse.service.consul"
        CUBEJS_REDIS_URL = "redis://redis.service.consul:6379"
        CUBEJS_CUBESTORE_HOST = "cubestore.service.consul"
        CUBEJS_REFRESH_WORKER = true
      }

      config {
        image = "ghcr.io/schneefux/brawltime-cube:latest"
        dns_servers = ["${attr.unique.network.ip-address}"]
      }

      resources {
        cpu = 64
        memory = 96
      }
    }
  }
}
