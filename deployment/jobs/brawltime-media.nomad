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

  affinity {
    attribute = "${node.class}"
    operator = "regexp"
    value = "worker"
  }

  # workaround for limited support for scaling jobs with single writer nodes
  # https://github.com/hashicorp/nomad/issues/10157
  constraint {
    attribute = "${attr.unique.hostname}"
    value = "brawltime-colt"
  }

  update {
    max_parallel = 1
    canary = 1
    min_healthy_time = "10s"
    healthy_deadline = "5m"
    auto_revert = true
    auto_promote = true
  }

  group "media" {
    count = 2

    scaling {
      enabled = true
      min = 1
      max = 8

      policy {
        check "high_cpu" {
          source = "nomad-apm"
          group = "cpu-allocated"
          query = "avg_cpu-allocated"

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
        "traefik.http.routers.brawltime-media.rule=Host(`media.${var.domain}`)",
      ]

      check {
        type = "http"
        path = "/status"
        interval = "10s"
        timeout = "2s"

        check_restart {
          limit = 5
        }
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
        image = "ghcr.io/schneefux/brawltime-media:${var.tag}"
        ports = ["http"]
        dns_servers = ["${attr.unique.network.ip-address}"]
      }

      resources {
        cpu = 96
        memory = 196
        memory_max = 512
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

        check_restart {
          limit = 5
        }
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
        cpu = 32
        memory = 32
      }
    }
  }
}
