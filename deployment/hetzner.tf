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

resource "hcloud_server" "brawltime1" {
  name = "brawltime1"
  location = "nbg1"
  image = "docker-ce"
  server_type = "cx11"
  keep_disk = true
  ssh_keys = [hcloud_ssh_key.default.id]
  user_data = file("init-brawltime1.yml")
  network {
    network_id = hcloud_network.default.id
    ip = "10.0.0.2"
  }
  depends_on = [
    hcloud_network_subnet.default
  ]
}


resource "cloudflare_record" "translate4" {
  zone_id = var.cloudflare_zone_id
  name = "translate"
  value = hcloud_server.brawltime1.ipv4_address
  type = "A"
  proxied = true
}

resource "cloudflare_record" "translate6" {
  zone_id = var.cloudflare_zone_id
  name = "translate"
  value = hcloud_server.brawltime1.ipv6_address
  type = "AAAA"
  proxied = true
}
