variable "hcloud_token" {}

job "hcloud-csi-node" {
  datacenters = ["dc1"]
  type = "system"

  priority = 100

  group "node" {
    task "plugin" {
      driver = "docker"

      config {
        image = "hetznercloud/hcloud-csi-driver:v2.16.0"
        entrypoint = [ "/bin/sh", "-c" ]
        command = "/bin/hcloud-csi-driver -node"
        privileged = true
      }

      env {
        CSI_ENDPOINT = "unix:///csi/csi.sock"
        ENABLE_METRICS = true
      }

      csi_plugin {
        id = "csi.hetzner.cloud"
        type = "node"
        mount_dir = "/csi"
      }

      resources {
        cpu = 16
        memory = 64
      }
    }
  }
}
