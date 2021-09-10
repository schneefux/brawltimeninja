resource "cloudflare_page_rule" "domain_cache_all" {
  priority = 2
  status = "active"
  target = "brawltime.ninja/*"
  actions {
    always_use_https = "on"
    cache_level = "cache_everything"
  }
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_page_rule" "subdomains_cache_all" {
  priority = 1
  status = "active"
  target = "*.brawltime.ninja/*"
  actions {
    always_use_https = "on"
    cache_level = "cache_everything"
  }
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_record" "terraform_managed_resource_d992f4146b9b9f21a03058236ba07696" {
  name = "brawltime.ninja"
  proxied = true
  ttl = 1
  type = "A"
  value = "195.201.224.98"
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_record" "terraform_managed_resource_47d3e327940d63c9eca39f5424817abd" {
  name = "brawltime.ninja"
  proxied = true
  ttl = 1
  type = "AAAA"
  value = "2a01:4f8:1c1c:59bf::1"
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_record" "terraform_managed_resource_5dd755641c32f6a71f61e7c7244bf1cb" {
  name = "api"
  proxied = true
  ttl = 1
  type = "CNAME"
  value = "brawltime.ninja"
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_record" "terraform_managed_resource_49374f284aa7dc8fc8802a765c892ceb" {
  name = "auth"
  proxied = true
  ttl = 1
  type = "CNAME"
  value = "brawltime.ninja"
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_record" "terraform_managed_resource_fc65bea469080a63ebfbdb1b117e405a" {
  name = "clicker"
  proxied = true
  ttl = 1
  type = "CNAME"
  value = "brawltime.ninja"
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_record" "terraform_managed_resource_39af234c1d34963a2b42edaf6e49f729" {
  name = "cube"
  proxied = true
  ttl = 1
  type = "CNAME"
  value = "brawltime.ninja"
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_record" "terraform_managed_resource_6d0330c3bb0618ffaa38029912ebb65e" {
  name = "media"
  proxied = true
  ttl = 1
  type = "CNAME"
  value = "brawltime.ninja"
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_record" "terraform_managed_resource_72bbe75a7129d803930b3baa8aec5ac4" {
  name = "render"
  proxied = true
  ttl = 1
  type = "CNAME"
  value = "brawltime.ninja"
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_record" "terraform_managed_resource_717129edc7b2fe70412fed761f622c32" {
  name = "testing"
  proxied = true
  ttl = 1
  type = "CNAME"
  value = "brawltime.ninja"
  zone_id = var.cloudflare_zone_id
}

resource "cloudflare_record" "terraform_managed_resource_c01031c8e5c813a113b35bcdb8dce4ea" {
  name = "www"
  proxied = true
  ttl = 1
  type = "CNAME"
  value = "brawltime.ninja"
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

