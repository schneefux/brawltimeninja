output "public_ip4" {
  value = hcloud_server.brawltime1.ipv4_address
}

output "status" {
  value = hcloud_server.brawltime1.status
}
