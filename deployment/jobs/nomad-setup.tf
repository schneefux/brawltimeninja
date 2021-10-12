resource "nomad_job" "plugin_hcloud_csi" {
  jobspec = file("${path.module}/plugin-hcloud-csi.nomad")

  lifecycle {
    ignore_changes = [
      allocation_ids,
    ]
  }

  hcl2 {
    enabled = true
    vars = {
      hcloud_token = var.hcloud_token
    }
  }
}

resource "nomad_scheduler_config" "config" {
  scheduler_algorithm = "spread"
  memory_oversubscription_enabled = true
  preemption_config = {
    system_scheduler_enabled = true
    batch_scheduler_enabled = true
    service_scheduler_enabled = true
  }
}

data "nomad_plugin" "hetzner" {
  depends_on = [nomad_job.plugin_hcloud_csi]
  plugin_id = "csi.hetzner.cloud"
  wait_for_healthy = true
}
