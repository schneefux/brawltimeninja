resource "nomad_job" "hcloud_controller" {
  jobspec = file("hcloud-csi-controller.nomad")

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

resource "nomad_job" "hcloud_node" {
  jobspec = file("hcloud-csi-node.nomad")

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
  depends_on = [nomad_job.hcloud_controller, nomad_job.hcloud_node]
  plugin_id = "csi.hetzner.cloud"
  wait_for_healthy = true
}
