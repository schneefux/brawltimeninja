variable "hcloud_token" {}

job "hcloud-csi-controller" {
  datacenters = ["dc1"]
  type = "service"

  priority = 100

  constraint {
    attribute = "${node.class}"
    value = "database"
  }

  group "controller" {
    count = 2

    constraint {
      distinct_hosts = true
    }

    update {
      max_parallel     = 1
      canary           = 1
      min_healthy_time = "10s"
      healthy_deadline = "1m"
      auto_revert      = true
      auto_promote     = true
    }

    task "plugin" {
      driver = "docker"

      config {
        image = "hetznercloud/hcloud-csi-driver:v2.16.0"
        entrypoint = [ "/bin/sh", "-c" ]
        command = "/bin/hcloud-csi-driver -controller"
      }

      env {
        CSI_ENDPOINT = "unix:///csi/csi.sock"
        ENABLE_METRICS = true
        HCLOUD_TOKEN = var.hcloud_token
      }

      csi_plugin {
        id = "csi.hetzner.cloud"
        type = "controller"
        mount_dir = "/csi"
      }

      resources {
        cpu = 16
        memory = 64
      }
    }
  }
}
