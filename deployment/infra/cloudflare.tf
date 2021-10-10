variable "cloudflare_zone_id" {}

resource "cloudflare_page_rule" "domain_cache_all" {
  priority = 1
  status = "active"
  target = "brawltime.ninja/*"
  actions {
    cache_level = "cache_everything"
    ssl = "full"
  }
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_page_rule" "subdomains_cache_all" {
  priority = 2
  status = "active"
  target = "*.brawltime.ninja/*"
  actions {
    cache_level = "cache_everything"
    ssl = "full"
  }
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_record" "ahrefs" {
  name = "brawltime.ninja"
  proxied = false
  ttl = 1
  type = "TXT"
  value = "ahrefs-site-verification_ab47a74517853848cb39e5123dbc37cd88c466922fb60d5495a0fe8817bf09fb"
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_record" "google" {
  name = "brawltime.ninja"
  proxied = false
  ttl = 1
  type = "TXT"
  value = "google-site-verification=c9eh4N0yPuMHdFLulSEXev_9kVOt-H25E3n9Sv--ZiM"
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_record" "mbo1" {
  name = "brawltime.ninja"
  priority = 10
  proxied = false
  ttl = 1
  type = "MX"
  value = "mxext1.mailbox.org"
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_record" "mbo2" {
  name = "brawltime.ninja"
  priority = 10
  proxied = false
  ttl = 1
  type = "MX"
  value = "mxext2.mailbox.org"
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_record" "mbo3" {
  name = "brawltime.ninja"
  priority = 20
  proxied = false
  ttl = 1
  type = "MX"
  value = "mxext3.mailbox.org"
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_record" "mbo_dkim" {
  name = "mbo0001._domainkey"
  proxied = false
  ttl = 1
  type = "TXT"
  value = "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2K4PavXoNY8eGK2u61LIQlOHS8f5sWsCK5b+HMOfo0M+aNHwfqlVdzi/IwmYnuDKuXYuCllrgnxZ4fG4yVaux58v9grVsFHdzdjPlAQfp5rkiETYpCMZwgsmdseJ4CoZaosPHLjPumFE/Ua2WAQQljnunsM9TONM9L6KxrO9t5IISD1XtJb0bq1lVI/e72k3mnPd/q77qzhTDmwN4TSNJZN8sxzUJx9HNSMRRoEIHSDLTIJUK+Up8IeCx0B7CiOzG5w/cHyZ3AM5V8lkqBaTDK46AwTkTVGJf59QxUZArG3FEH5vy9HzDmy0tGG+053/x4RqkhqMg5/ClDm+lpZqWwIDAQAB"
  zone_id = var.cloudflare_zone_id
}

