resource "nomad_job" "plugin_hcloud_csi" {
  jobspec = file("${path.module}/plugin-hcloud-csi.nomad")

  hcl2 {
    enabled = true
    vars = {
      hcloud_token = var.hcloud_token
    }
  }
}

data "nomad_plugin" "hetzner" {
  depends_on = [nomad_job.plugin_hcloud_csi]
  plugin_id = "csi.hetzner.cloud"
  wait_for_healthy = true
}
