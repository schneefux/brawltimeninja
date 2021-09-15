output "public_ip4" {
  value = [for server in hcloud_server.default : server.ipv4_address]
}
