resource "nomad_job" "ingress" {
  jobspec = file("${path.module}/ingress.nomad")

  lifecycle {
    ignore_changes = [
      allocation_ids,
    ]
  }

  hcl2 {
    enabled = true
    allow_fs = true
  }
}

resource "hcloud_volume" "mariadb" {
  name = "mariadb-database"
  location = "nbg1"
  size = 10
  format = "ext4"
  delete_protection = true
}

resource "nomad_volume" "mariadb" {
  depends_on = [data.nomad_plugin.hetzner]
  type = "csi"
  plugin_id = "csi.hetzner.cloud"

  volume_id = "mariadb-database"
  name = "mariadb-database"
  external_id = hcloud_volume.mariadb.id

  capability {
    access_mode = "single-node-writer"
    attachment_mode = "file-system"
  }
}

resource "nomad_job" "mariadb" {
  depends_on = [nomad_volume.mariadb]
  jobspec = file("${path.module}/mariadb.nomad")

  lifecycle {
    ignore_changes = [
      allocation_ids,
    ]
  }
}

resource "hcloud_volume" "clickhouse" {
  name = "clickhouse-database"
  location = "nbg1"
  size = 40
  format = "ext4"
  delete_protection = true
}

resource "nomad_volume" "clickhouse" {
  depends_on = [data.nomad_plugin.hetzner]
  type = "csi"
  plugin_id = "csi.hetzner.cloud"

  volume_id = "clickhouse-database"
  name = "clickhouse-database"
  external_id = hcloud_volume.clickhouse.id

  capability {
    access_mode = "single-node-writer"
    attachment_mode = "file-system"
  }
}

resource "nomad_job" "clickhouse" {
  depends_on = [nomad_volume.clickhouse]
  jobspec = file("${path.module}/clickhouse.nomad")

  lifecycle {
    ignore_changes = [
      allocation_ids,
    ]
  }

  hcl2 {
    enabled = true
    allow_fs = true
  }
}

resource "nomad_job" "redis" {
  jobspec = file("${path.module}/redis.nomad")

  lifecycle {
    ignore_changes = [
      allocation_ids,
    ]
  }
}

variable "traduora_google_client_id" {}
variable "traduora_google_client_secret" {}
variable "traduora_secret" {}

resource "nomad_job" "traduora" {
  jobspec = file("${path.module}/traduora.nomad")

  lifecycle {
    ignore_changes = [
      allocation_ids,
    ]
  }

  hcl2 {
    enabled = true
    vars = {
      "traduora_google_client_id" = var.traduora_google_client_id
      "traduora_google_client_secret" = var.traduora_google_client_secret
      "traduora_secret" = var.traduora_secret
    }
  }
}

variable "brawlstars_email" {}
variable "brawlstars_password" {}
variable "brawlapi_token" {}

resource "hcloud_volume" "brawltime_assets" {
  name = "brawltime-assets"
  location = "nbg1"
  size = 10
  format = "ext4"
  delete_protection = true
}

resource "nomad_volume" "brawltime_assets" {
  depends_on = [data.nomad_plugin.hetzner]
  type = "csi"
  plugin_id = "csi.hetzner.cloud"

  volume_id = "brawltime-assets"
  name = "brawltime-assets"
  external_id = hcloud_volume.brawltime_assets.id

  capability {
    access_mode = "single-node-writer"
    attachment_mode = "file-system"
  }
}

resource "nomad_job" "brawltime" {
  jobspec = file("${path.module}/brawltime.nomad")

  lifecycle {
    ignore_changes = [
      allocation_ids,
    ]
  }

  hcl2 {
    enabled = true
    allow_fs = true
    vars = {
      "brawlstars_email" = var.brawlstars_email
      "brawlstars_password" = var.brawlstars_password
      "brawlapi_token" = var.brawlapi_token
    }
  }
}
