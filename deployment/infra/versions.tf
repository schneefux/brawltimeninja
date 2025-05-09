terraform {
  required_providers {
    hcloud = {
      source = "hetznercloud/hcloud"
    }

    cloudflare = {
      source = "cloudflare/cloudflare"
      version = "~> 2.0"
    }

    minio = {
      source = "aminueza/minio"
      version = "~> 3.0"
    }
  }
}
