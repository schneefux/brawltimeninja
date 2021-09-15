variable "hcloud_token" {}

job "plugin-hcloud-csi" {
  datacenters = ["dc1"]
  type = "system"

  group "node" {
    task "plugin" {
      driver = "docker"

      config {
        image = "hetznercloud/hcloud-csi-driver:1.6.0"
        privileged = true
      }

      env {
        CSI_ENDPOINT = "unix:///csi/csi.sock"
        HCLOUD_TOKEN = var.hcloud_token
      }

      csi_plugin {
        id = "csi.hetzner.cloud"
        type = "monolith"
        mount_dir = "/csi"
      }

      resources {
        cpu = 500
        memory = 256
      }
    }
  }
}
