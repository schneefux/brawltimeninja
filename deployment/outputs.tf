output "ingress_ip4" {
  value = hcloud_server.default["barley"].ipv4_address
}

output "ingress_ssh_key" {
  value = var.ssh_private_key_path
}

output "public_ip4" {
  value = [for server in hcloud_server.default : server.ipv4_address]
}
