[entryPoints]
  [entryPoints.http]
    address = ":8088"
  [forwardedHeaders]
    trustedIPs = ["127.0.0.1/32"]

[api]
  dashboard = true
  insecure = true

[providers.consulCatalog]
  prefix = "traefik"
  exposedByDefault = false
