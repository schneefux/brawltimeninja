[entryPoints]
  [entryPoints.http]
    address = ":8088"
  [entryPoints.ssh]
    address = ":2222"
  [forwardedHeaders]
    trustedIPs = ["127.0.0.1/32"]

[api]
  dashboard = true
  insecure = true

[providers.consulCatalog]
  prefix = "traefik"
  exposedByDefault = false

[metrics]
  [metrics.datadog]
    address = "{{ env "HOST_IP" }}:8125"
