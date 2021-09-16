variable "hcloud_token" {}

provider "hcloud" {
  token = var.hcloud_token
}

provider "nomad" {
  address = "http://localhost:4646"
}
