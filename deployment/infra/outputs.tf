variable "ssh_private_key_path" {}

output "ingress_ip4" {
  value = hcloud_server.default["barley"].ipv4_address
}

output "ingress_ssh_key" {
  value = var.ssh_private_key_path
}

output "public_ip4" {
  value = [for server in hcloud_server.default : server.ipv4_address]
}

output "network_id" {
  value = hcloud_network.default.id
}

output "clickhouse_backup_url" {
  value = "${minio_s3_bucket.clickhouse_backup.bucket}"
}
