variable "ssh_private_key_path" {}
variable "start_proxy" {
  default = true
}

resource "null_resource" "port_forward" {
  provisioner "local-exec" {
    command = <<EOF
      ${var.start_proxy ? "" : "exit 0" }
      nohup ssh -o StrictHostKeyChecking=no -i ${var.ssh_private_key_path} -L 4646:localhost:4646 -L 8500:localhost:8500 -L 8080:localhost:8080 root@${hcloud_server.default["barley"].ipv4_address} &
      disown
    EOF
    interpreter = ["bash", "-c"]
  }

  triggers = {
    always_run = "${timestamp()}"
  }
}

provider "nomad" {
  address = "http://localhost:4646"
}

resource "nomad_job" "plugin_hcloud_csi" {
  depends_on = [null_resource.port_forward]
  jobspec = file("${path.module}/jobs/plugin-hcloud-csi.nomad")

  hcl2 {
    enabled = true
    vars = {
      hcloud_token = var.hcloud_token
    }
  }
}

data "nomad_plugin" "hetzner" {
  depends_on = [null_resource.port_forward, nomad_job.plugin_hcloud_csi]
  plugin_id = "csi.hetzner.cloud"
  wait_for_healthy = true
}
