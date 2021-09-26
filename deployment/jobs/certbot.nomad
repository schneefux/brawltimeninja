variable "cloudflare_dns_token" {}
variable "letsencrypt_mail" {}

job "certbot" {
  datacenters = ["dc1"]
  type = "batch"

  constraint {
    attribute = "${node.class}"
    value = "ingress"
  }

  periodic {
    cron = "@daily"
    prohibit_overlap = true
  }

  group "certbot" {
    volume "certs" {
      type = "host"
      source = "certs"
    }

    task "certbot" {
      driver = "docker"

      config {
        image = "certbot/dns-cloudflare"
        command = "certonly"
        args = [
          "--agree-tos",
          "--non-interactive",
          "-m", "${var.letsencrypt_mail}",
          "--dns-cloudflare",
          "--dns-cloudflare-credentials",
          "/secrets/cloudflare.ini",
          "-d", "*.brawltime.ninja",
        ]
      }

      volume_mount {
        volume = "certs"
        read_only = false
        destination = "/etc/letsencrypt"
      }

      template {
        data = <<-EOF
          dns_cloudflare_api_token = ${var.cloudflare_dns_token}
        EOF
        destination = "secrets/cloudflare.ini"
      }

      resources {
        cpu = 256
        memory = 64
      }
    }

    task "nginx-reload" {
      lifecycle {
        hook = "poststop"
      }

      driver = "exec"

      config {
        command = "bash"
        args = ["-c", "consul kv put certs/last-update $(date --iso-8601=second)"]
      }

      resources {
        cpu = 64
        memory = 32
      }
    }
  }
}
