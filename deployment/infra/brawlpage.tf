variable "cloudflare_zone_id_brawlpage" {}

resource "cloudflare_page_rule" "brawlpage_domain_cache_all" {
  priority = 1
  status = "active"
  target = "brawl.page/*"
  actions {
    cache_level = "cache_everything"
    ssl = "full"
  }
  zone_id = var.cloudflare_zone_id_brawlpage
}

resource "cloudflare_page_rule" "brawlpage_subdomains_cache_all" {
  priority = 2
  status = "active"
  target = "*.brawl.page/*"
  actions {
    cache_level = "cache_everything"
    ssl = "full"
  }
  zone_id = var.cloudflare_zone_id_brawlpage
}

resource "cloudflare_record" "brawlpage_mbo1" {
  name = "brawl.page"
  priority = 10
  proxied = false
  ttl = 1
  type = "MX"
  value = "mxext1.mailbox.org"
  zone_id = var.cloudflare_zone_id_brawlpage
}

resource "cloudflare_record" "brawlpage_mbo2" {
  name = "brawl.page"
  priority = 10
  proxied = false
  ttl = 1
  type = "MX"
  value = "mxext2.mailbox.org"
  zone_id = var.cloudflare_zone_id_brawlpage
}

resource "cloudflare_record" "brawlpage_mbo3" {
  name = "brawl.page"
  priority = 20
  proxied = false
  ttl = 1
  type = "MX"
  value = "mxext3.mailbox.org"
  zone_id = var.cloudflare_zone_id_brawlpage
}

resource "cloudflare_record" "brawlpage_mbo_verification" {
  name = "118b8e7d50e47036dcf5305719cedebf34f72727"
  proxied = false
  ttl = 1
  type = "TXT"
  value = "c6c042154410c1cd9e3725337c047c5c3a0ef866"
  zone_id = var.cloudflare_zone_id_brawlpage
}

resource "cloudflare_record" "brawlpage_mbo_dkim" {
  name = "mbo0001._domainkey"
  proxied = false
  ttl = 1
  type = "TXT"
  value = "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2K4PavXoNY8eGK2u61LIQlOHS8f5sWsCK5b+HMOfo0M+aNHwfqlVdzi/IwmYnuDKuXYuCllrgnxZ4fG4yVaux58v9grVsFHdzdjPlAQfp5rkiETYpCMZwgsmdseJ4CoZaosPHLjPumFE/Ua2WAQQljnunsM9TONM9L6KxrO9t5IISD1XtJb0bq1lVI/e72k3mnPd/q77qzhTDmwN4TSNJZN8sxzUJx9HNSMRRoEIHSDLTIJUK+Up8IeCx0B7CiOzG5w/cHyZ3AM5V8lkqBaTDK46AwTkTVGJf59QxUZArG3FEH5vy9HzDmy0tGG+053/x4RqkhqMg5/ClDm+lpZqWwIDAQAB"
  zone_id = var.cloudflare_zone_id_brawlpage
}

resource "cloudflare_record" "brawlpage4" {
  zone_id = var.cloudflare_zone_id_brawlpage
  name = "brawl.page"
  value = hcloud_server.default["barley"].ipv4_address
  type = "A"
  proxied = true
}

resource "cloudflare_record" "brawlpage6" {
  zone_id = var.cloudflare_zone_id_brawlpage
  name = "brawl.page"
  value = hcloud_server.default["barley"].ipv6_address
  type = "AAAA"
  proxied = true
}

resource "cloudflare_record" "brawlpagewww" {
  zone_id = var.cloudflare_zone_id_brawlpage
  name = "www"
  proxied = true
  type = "CNAME"
  value = "brawl.page"
}

resource "cloudflare_record" "brawlpagegoogle" {
  name = "brawl.page"
  proxied = false
  ttl = 1
  type = "TXT"
  value = "google-site-verification=JVY_010qIWClYTs3o_lWP4OEHGQ5ipOgcCLf2G2tY5Y"
  zone_id = var.cloudflare_zone_id_brawlpage
}

