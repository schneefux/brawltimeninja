variable "hcloud_token" {}

job "hcloud-csi-controller" {
  datacenters = ["dc1"]
  type = "service"

  constraint {
    attribute = "${node.class}"
    value = "ingress"
  }

  group "controller" {
    task "plugin" {
      driver = "docker"

      config {
        image = "hetznercloud/hcloud-csi-driver:v2.3.2"
        command = "bin/hcloud-csi-driver-controller"
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
