variable "ssh_public_key_name" {}
variable "ssh_public_key_path" {}
variable "datadog_api_key" {}

resource "hcloud_ssh_key" "default" {
  name = var.ssh_public_key_name
  public_key = file(var.ssh_public_key_path)
}

resource "hcloud_network" "default" {
  name = "brawltime-net"
  ip_range = "10.0.0.0/16"
}

resource "hcloud_network_subnet" "default" {
  type = "cloud"
  network_id = hcloud_network.default.id
  network_zone = "eu-central"
  ip_range = "10.0.0.0/24"
}

resource "hcloud_firewall" "default" {
  name = "brawltime-fw"
  apply_to {
    label_selector = "firewall"
  }

  rule {
    direction = "in"
    protocol  = "icmp"
    source_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }

  rule {
    direction = "in"
    protocol  = "tcp"
    port = "any"
    source_ips = [
      hcloud_network.default.ip_range
    ]
  }

  rule {
    direction = "in"
    protocol  = "udp"
    port = "any"
    source_ips = [
      hcloud_network.default.ip_range
    ]
  }

  rule {
    direction = "in"
    protocol  = "tcp"
    port = "22"
    source_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }

  rule {
    direction = "in"
    protocol  = "tcp"
    port = "2222"
    source_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }

  rule {
    direction = "in"
    protocol  = "tcp"
    port = "80"
    source_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }

  rule {
    direction = "in"
    protocol  = "tcp"
    port = "443"
    source_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }

  depends_on = [
    hcloud_network.default
  ]
}

# TODO set datacenter names to Hetzner cloud region name
variable "servers" {
  type = map
  default = {
    barley = {
      server_type = "cpx11"
      class = "ingress"
      location = "nbg1"
    }
    /*
    colt = {
      server_type = "cpx21"
      class = "database"
      location = "nbg1"
    }
    */
    dynamike = {
      server_type = "cpx51"
      class = "database"
      location = "nbg1"
    }
    /*
    pam = {
      server_type = "cax41"
      class = "database"
      location = "nbg1"
    }
    */
    hank = {
      server_type = "cax21"
      class = "database"
      location = "nbg1"
    }
    /*
    edgar = {
      server_type = "cpx11"
      class = "worker"
    }
    */
    /*
    frank = {
      server_type = "cpx11"
      class = "worker"
    }
    */
    /*
    gene = {
      server_type = "cpx11"
      class = "worker"
    }
    */
    /*
    jessie = {
      server_type = "cpx11"
      class = "worker"
    }
    */
    /*
    lou = {
      server_type = "cpx11"
      class = "worker"
    }
*/
/*
    max = {
      server_type = "cpx11"
      class = "worker"
    }
*/
/*
    nani = {
      server_type = "cpx11"
      ip = "10.0.0.11"
      class = "worker"
    }
*/
    # timeouts and DNS errors after change?
    # -> restart dnsmasq or nginx (TODO investigate why)
  }
}

# sync with autoscaler.nomad target
resource "hcloud_server" "default" {
  for_each = var.servers

  name = "brawltime-${each.key}"
  location = each.value.location
  #datacenter = "nbg1-dc3"
  image = "docker-ce"
  server_type = each.value.server_type
  keep_disk = true
  ssh_keys = [hcloud_ssh_key.default.id]
  user_data = templatefile("${path.module}/conf/cloudinit-${each.value.class}.yml.tpl", {
    class = each.value.class,
    datadog_api_key = var.datadog_api_key,
  })
  network {
    network_id = hcloud_network.default.id
    ip = each.value.class == "ingress" ? "10.0.0.2" : null
  }
  depends_on = [
    hcloud_network_subnet.default
  ]
  labels = {
    "firewall" = "true"
    "nomad_class" = each.value.class
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes = [
      user_data,
      network,
    ]
  }
}

# brawltime
resource "cloudflare_record" "translate4" {
  zone_id = var.cloudflare_zone_id
  name = "translate"
  value = hcloud_server.default["barley"].ipv4_address
  type = "A"
  proxied = true
}

resource "cloudflare_record" "translate6" {
  zone_id = var.cloudflare_zone_id
  name = "translate"
  value = hcloud_server.default["barley"].ipv6_address
  type = "AAAA"
  proxied = true
}

resource "cloudflare_record" "staging4" {
  zone_id = var.cloudflare_zone_id
  name = "staging"
  value = hcloud_server.default["barley"].ipv4_address
  type = "A"
  proxied = true
}

resource "cloudflare_record" "staging6" {
  zone_id = var.cloudflare_zone_id
  name = "staging"
  value = hcloud_server.default["barley"].ipv6_address
  type = "AAAA"
  proxied = true
}

resource "cloudflare_record" "brawltime4" {
  zone_id = var.cloudflare_zone_id
  name = "brawltime.ninja"
  value = hcloud_server.default["barley"].ipv4_address
  type = "A"
  proxied = true
}

resource "cloudflare_record" "brawltime6" {
  zone_id = var.cloudflare_zone_id
  name = "brawltime.ninja"
  value = hcloud_server.default["barley"].ipv6_address
  type = "AAAA"
  proxied = true
}

resource "cloudflare_record" "www" {
  zone_id = var.cloudflare_zone_id
  name = "www"
  proxied = true
  type = "CNAME"
  value = "brawltime.ninja"
}

resource "cloudflare_record" "ssh4" {
  zone_id = var.cloudflare_zone_id
  name = "ssh"
  value = hcloud_server.default["barley"].ipv4_address
  type = "A"
  proxied = false
}

resource "cloudflare_record" "ssh6" {
  zone_id = var.cloudflare_zone_id
  name = "ssh"
  value = hcloud_server.default["barley"].ipv6_address
  type = "AAAA"
  proxied = false
}

resource "cloudflare_record" "api" {
  zone_id = var.cloudflare_zone_id
  name = "api"
  proxied = true
  type = "CNAME"
  value = "brawltime.ninja"
}

resource "cloudflare_record" "clicker" {
  zone_id = var.cloudflare_zone_id
  name = "clicker"
  proxied = true
  type = "CNAME"
  value = "brawltime.ninja"
}

resource "cloudflare_record" "render" {
  zone_id = var.cloudflare_zone_id
  name = "render"
  proxied = true
  type = "CNAME"
  value = "brawltime.ninja"
}

resource "cloudflare_record" "media" {
  zone_id = var.cloudflare_zone_id
  name = "media"
  proxied = true
  type = "CNAME"
  value = "brawltime.ninja"
}

resource "cloudflare_record" "cube" {
  zone_id = var.cloudflare_zone_id
  name = "cube"
  proxied = true
  type = "CNAME"
  value = "brawltime.ninja"
}

resource "cloudflare_record" "testing" {
  zone_id = var.cloudflare_zone_id
  name = "testing"
  proxied = true
  type = "CNAME"
  value = "brawltime.ninja"
}

resource "cloudflare_record" "nomad" {
  zone_id = var.cloudflare_zone_id
  name = "nomad"
  proxied = true
  type = "CNAME"
  value = "brawltime.ninja"
}

resource "cloudflare_record" "traefik" {
  zone_id = var.cloudflare_zone_id
  name = "traefik"
  proxied = true
  type = "CNAME"
  value = "brawltime.ninja"
}

resource "minio_s3_bucket" "clickhouse_backup" {
  bucket = "brawltime-clickhouse-backup"
  acl = "private"
  object_locking = false
}

# create any ilm first or terraform will fail with NoSuchLifecycleConfiguration
# ex.: mc ilm rule add brawltime/brawltime-clickhouse-backup --expire-days 10
# (this policy will overwrite existing rules)
resource "minio_ilm_policy" "clickhouse_backup_full" {
  bucket = minio_s3_bucket.clickhouse_backup.bucket

  rule {
    id = "expire-90-days"
    expiration = "90d"
  }
}
