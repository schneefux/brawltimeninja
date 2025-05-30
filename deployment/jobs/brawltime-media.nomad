variable "github_user" {}
variable "github_token" {}
variable "brawltime_assets_pubkey" {}
variable "brawltime_assets_hostkey_ed" {}
variable "brawltime_assets_hostkey_rsa" {}

# git hash or "latest"
variable "tag" {}

variable "domain" {
  default = "brawltime.ninja"
}

locals {
  # docker node image default UID
  asset_uid = 1000
}

job "brawltime-media" {
  datacenters = ["dc1"]

  priority = 80

  constraint {
    attribute = "${node.class}"
    value = "worker"
  }

  # disabled, scaling is currently not working with volume
  /*
  update {
    auto_revert = true
    auto_promote = true
    canary = 1
  }
  */

  group "media" {
    stop_after_client_disconnect = "15m" # free up volume if disconnected from Nomad for a long time

    count = 1

    /*
    scaling {
      enabled = true
      min = 1
      max = 8

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
    */

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

    task "media" {
      driver = "docker"

      service {
        name = "brawltime-media"
        provider = "nomad"
        port = "http"

        tags = [
          "traefik.enable=true",
          "traefik.http.routers.brawltime-media.rule=Host(`media.${var.domain}`)",
        ]

        check {
          type = "http"
          path = "/status"
          interval = "10s"
          timeout = "2s"

          check_restart {
            limit = 6
          }
        }
      }

      volume_mount {
        volume = "brawltime-assets-volume"
        destination = "/assets/"
      }

      env {
        PORT = "${NOMAD_PORT_http}"
        ASSET_DIR = "/assets/"
        DD_AGENT_HOST = "${attr.unique.network.ip-address}"
        NODE_OPTIONS = "--max-old-space-size=${512}" # sharp will use about 300MB more
      }

      config {
        image = "ghcr.io/schneefux/brawltime-media:${var.tag}"
        ports = ["http"]

        auth {
          username = "${var.github_user}"
          password = "${var.github_token}"
        }
      }

      resources {
        cpu = 1024
        memory = 896 # reserve some for sharp cache
        memory_max = 1024
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

    task "sftp" {
      driver = "docker"

      service {
        name = "brawltime-media-sftp"
        provider = "nomad"
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

          check_restart {
            limit = 5
          }
        }
      }

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
        perms = 0600
      }

      template {
        data = "${var.brawltime_assets_hostkey_rsa}"
        destination = "secrets/hostkey.rsa"
        perms = 0600
      }

      resources {
        cpu = 32
        memory = 32
        memory_max = 256
      }
    }
  }
}
