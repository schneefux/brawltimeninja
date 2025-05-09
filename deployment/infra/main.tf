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

variable "s3_access_key" {}
variable "s3_secret_key" {}

provider "minio" {
  minio_server = "nbg1.your-objectstorage.com"
  minio_user = "${var.s3_access_key}"
  minio_password = "${var.s3_secret_key}"
  minio_region = "nbg1"
  minio_ssl = true
}
