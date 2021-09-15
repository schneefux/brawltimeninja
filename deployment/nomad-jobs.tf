resource "nomad_job" "ingress" {
  depends_on = [null_resource.port_forward]
  jobspec = file("./jobs/ingress.nomad")

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
  depends_on = [null_resource.port_forward, data.nomad_plugin.hetzner]
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
  depends_on = [null_resource.port_forward, nomad_volume.mariadb]
  jobspec = file("./jobs/mariadb.nomad")
}

resource "hcloud_volume" "clickhouse" {
  name = "clickhouse-database"
  location = "nbg1"
  size = 10
  format = "ext4"
  delete_protection = true
}

resource "nomad_volume" "clickhouse" {
  depends_on = [null_resource.port_forward, data.nomad_plugin.hetzner]
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
  depends_on = [null_resource.port_forward, nomad_volume.clickhouse]
  jobspec = file("./jobs/clickhouse.nomad")

  hcl2 {
    enabled = true
    allow_fs = true
  }
}

resource "nomad_job" "traduora" {
  depends_on = [null_resource.port_forward]
  jobspec = file("./jobs/traduora.nomad")
}


resource "nomad_job" "brawltime" {
  depends_on = [null_resource.port_forward]
  jobspec = file("./jobs/brawltime.nomad")
}
