variable "hcloud_token" {}

provider "hcloud" {
  token = var.hcloud_token
}

variable "cloudflare_email" {}
variable "cloudflare_token" {}

provider "cloudflare" {
  email = var.cloudflare_email
  api_token = var.cloudflare_token
}
