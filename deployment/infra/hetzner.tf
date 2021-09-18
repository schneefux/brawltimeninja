variable "ssh_public_key_name" {}
variable "ssh_public_key_path" {}

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

variable "servers" {
  type = map
  default = {
    barley = {
      server_type = "cx11"
      ip = "10.0.0.2"
      leader = true
      leader_ip = ""
    }
    colt = {
      server_type = "cx21"
      ip = "10.0.0.3"
      leader = false
      leader_ip = "10.0.0.2"
    }
  }
}

resource "hcloud_server" "default" {
  for_each = var.servers

  name = "brawltime-${each.key}"
  location = "nbg1"
  image = "docker-ce"
  server_type = each.value.server_type
  keep_disk = true
  ssh_keys = [hcloud_ssh_key.default.id]
  user_data = templatefile("${path.module}/conf/cloudinit.yml.tpl", {
    ip = each.value.ip,
    leader = each.value.leader,
    leader_ip = each.value.leader_ip,
  })
  network {
    network_id = hcloud_network.default.id
    ip = each.value.ip
  }
  depends_on = [
    hcloud_network_subnet.default
  ]
  labels = {
    "firewall" = ""
  }
}

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

/*
resource "cloudflare_record" "testing" {
  zone_id = var.cloudflare_zone_id
  name = "testing"
  proxied = true
  type = "CNAME"
  value = "translate.brawltime.ninja"
}

resource "cloudflare_record" "cube" {
  zone_id = var.cloudflare_zone_id
  name = "cube"
  proxied = true
  type = "CNAME"
  value = "translate.brawltime.ninja"
}
*/

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

resource "cloudflare_record" "staging_api" {
  zone_id = var.cloudflare_zone_id
  name = "api-staging"
  proxied = true
  type = "CNAME"
  value = "staging.brawltime.ninja"
}

resource "cloudflare_record" "staging_clicker" {
  zone_id = var.cloudflare_zone_id
  name = "clicker-staging"
  proxied = true
  type = "CNAME"
  value = "staging.brawltime.ninja"
}

resource "cloudflare_record" "staging_render" {
  zone_id = var.cloudflare_zone_id
  name = "render-staging"
  proxied = true
  type = "CNAME"
  value = "staging.brawltime.ninja"
}

resource "cloudflare_record" "staging_media" {
  zone_id = var.cloudflare_zone_id
  name = "media-staging"
  proxied = true
  type = "CNAME"
  value = "staging.brawltime.ninja"
}

resource "cloudflare_record" "staging_cube" {
  zone_id = var.cloudflare_zone_id
  name = "cube-staging"
  proxied = true
  type = "CNAME"
  value = "staging.brawltime.ninja"
}
