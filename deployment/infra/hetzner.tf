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
      server_type = "cx11"
      ip = "10.0.0.2"
      class = "ingress"
      leader_ip = ""
    }
    colt = {
      server_type = "cpx11"
      ip = "10.0.0.3"
      class = "worker"
      leader_ip = "10.0.0.2"
    }
    dynamike = {
      server_type = "cx21"
      ip = "10.0.0.4"
      class = "database"
      leader_ip = "10.0.0.2"
    }
    edgar = {
      server_type = "cpx11"
      ip = "10.0.0.5"
      class = "worker"
      leader_ip = "10.0.0.2"
    }
    frank = {
      server_type = "cpx11"
      ip = "10.0.0.6"
      class = "worker"
      leader_ip = "10.0.0.2"
    }
    # timeouts and DNS errors after change?
    # -> restart dnsmasq (TODO investigate why)
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
    class = each.value.class,
    leader_ip = each.value.leader_ip,
    datadog_api_key = var.datadog_api_key,
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

  lifecycle {
    prevent_destroy = true
    ignore_changes = [
      user_data,
    ]
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
