[entryPoints]
  [entryPoints.http]
    address = ":8088"
  [entryPoints.ssh]
    address = ":2222"
  [forwardedHeaders]
    trustedIPs = ["127.0.0.1/32"]

[log]
  #level = "INFO"
  level = "DEBUG"

[api]
  dashboard = true

[providers.nomad]
  prefix = "traefik"
  stale = true  # allow reads from non-leaders, improves performance
  exposedByDefault = false

[metrics]
  [metrics.datadog]
    address = "{{ env "HOST_IP" }}:8125"
