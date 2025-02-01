user nginx;
worker_processes auto;
worker_rlimit_nofile 30000;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
  worker_connections  8192;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  # combined + cache status
  log_format combined_cache '$remote_addr - $remote_user [$time_local] '
                            '"$request" $status $body_bytes_sent '
                            '"$http_referer" "$http_user_agent" '
                            '$upstream_cache_status';
  error_log stderr;
  access_log /dev/stdout combined_cache;

  # NixOS defaults
  # optimisation
  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 65;
  types_hash_max_size 4096;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
  ssl_ciphers EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH;
  #ssl_dhparam /var/lib/dhparams/nginx.pem;
  # Keep in sync with https://ssl-config.mozilla.org/#server=nginx&config=intermediate
  ssl_session_timeout 1d;
  ssl_session_cache shared:SSL:10m;
  # Breaks forward secrecy: https://github.com/mozilla/server-side-tls/issues/135
  ssl_session_tickets off;
  # We don't enable insecure ciphers by default, so this allows
  # clients to pick the most performant, per https://github.com/mozilla/server-side-tls/issues/260
  ssl_prefer_server_ciphers off;
  # OCSP stapling
  ssl_stapling on;
  ssl_stapling_verify on;
  gzip on;
  gzip_proxied any;
  gzip_comp_level 5;
  gzip_types application/atom+xml application/javascript application/json application/xml application/xml+rss image/svg+xml text/css text/javascript text/plain text/xml;
  gzip_vary on;
  proxy_redirect          off;
  proxy_connect_timeout   60s;
  proxy_send_timeout      60s;
  proxy_read_timeout      60s;
  proxy_http_version      1.1;
  # recommended headers
  proxy_set_header        Host $host;
  proxy_set_header        X-Real-IP $remote_addr;
  proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header        X-Forwarded-Proto $scheme;
  proxy_set_header        X-Forwarded-Host $host;
  proxy_set_header        X-Forwarded-Server $host;

  # $connection_upgrade is used for websocket proxying
  map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
  }
  client_max_body_size 10m;
  server_tokens off;

  # https://support.cloudflare.com/hc/en-us/articles/200170786-Restoring-original-visitor-IPs-Logging-visitor-IP-addresses-with-mod-cloudflare-
  set_real_ip_from 103.21.244.0/22;
  set_real_ip_from 103.22.200.0/22;
  set_real_ip_from 103.31.4.0/22;
  set_real_ip_from 104.16.0.0/13;
  set_real_ip_from 104.24.0.0/14;
  set_real_ip_from 108.162.192.0/18;
  set_real_ip_from 131.0.72.0/22;
  set_real_ip_from 141.101.64.0/18;
  set_real_ip_from 162.158.0.0/15;
  set_real_ip_from 172.64.0.0/13;
  set_real_ip_from 173.245.48.0/20;
  set_real_ip_from 188.114.96.0/20;
  set_real_ip_from 190.93.240.0/20;
  set_real_ip_from 197.234.240.0/22;
  set_real_ip_from 198.41.128.0/17;
  set_real_ip_from 2400:cb00::/32;
  set_real_ip_from 2606:4700::/32;
  set_real_ip_from 2803:f800::/32;
  set_real_ip_from 2405:b500::/32;
  set_real_ip_from 2405:8100::/32;
  set_real_ip_from 2c0f:f248::/32;
  set_real_ip_from 2a06:98c0::/29;
  real_ip_header CF-Connecting-IP;

  proxy_cache_key $host$request_uri;
  proxy_cache_path {{ env "NOMAD_ALLOC_DIR" }}/data/nginx-cache-main levels=1:2 keys_zone=main-cache:64m inactive=1h max_size=16g use_temp_path=off;

  # A change to this configuration file triggers an nginx reload.
  # Include a timestamp so that nginx reloads when the certbot job
  # renews the certificate.
  {{ if nomadVarExists "letsencrypt" }}
  {{ with nomadVar "letsencrypt" }}
  # Certificates last updated: {{ .last_update }}
  {{ end }}
  {{ else }}
  # Certificates last updated: never
  {{ end }}
  ssl_certificate {{ env "SSL_PATH" }}/fullchain.pem;
  ssl_certificate_key {{ env "SSL_PATH" }}/privkey.pem;

  # Brawl Stars API Proxy

  upstream brawlstars {
    zone brawlstars_upstreams 64K;
    server api.brawlstars.com:443;
    keepalive 100;
  }

  server {
    listen 80;
    listen [::]:80;

    allow 10.0.0.0/8;
    allow fe80::/10;
    allow 127.0.0.1;
    allow ::1;
    deny all;

    server_name proxy.brawltime.ninja;

    location / {
      resolver 8.8.8.8 ipv6=off;
      proxy_pass https://brawlstars;
      proxy_set_header Authorization "Bearer {{ env "BRAWLSTARS_TOKEN" }}";
      proxy_set_header Host $http_host;

      add_header X-Proxy-Cache $upstream_cache_status;
      proxy_cache main-cache;
      proxy_cache_use_stale error timeout invalid_header updating http_500 http_502 http_503 http_504 http_429; # serve from cache instead
      proxy_cache_revalidate on; # use conditional requests
      proxy_cache_background_update on; # serve stale, update in background
      proxy_cache_lock on; # update cache using a single request, stalling others
      proxy_http_version 1.1;
      proxy_set_header Connection "";
    }
  }

  upstream traefik {
    zone traefik_upstreams 64K; # share memory to improve performance
    least_conn;
    {{- range nomadService "traefik" }}
    server {{ .Address }}:{{ .Port }};
    {{- else }}
    server 127.0.0.1:65535;
    {{- end }}
    keepalive 100;
  }

  server {
    listen {{ env "NOMAD_PORT_status" }};
    listen [::]:{{ env "NOMAD_PORT_status" }};
    server_name _;

    location /nginx_status {
      stub_status;
      access_log off;
    }
  }

  {{- range $i := loop 4 }}
  server {
    {{- if (eq $i 0) }}
    listen 80;
    listen [::]:80;
    {{- end }}
    {{- if (eq $i 1) }}
    listen 443 ssl default_server;
    listen [::]:443 ssl;
    http2 on;
    {{- end }}
    {{- if (gt $i 1) }}
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    {{- end }}

    {{- if (eq $i 0) }}
    server_name _;
    {{- end }}
    {{- if (eq $i 1) }}
    server_name _;
    {{- end }}
    {{- if (eq $i 2) }}
    server_name brawltime.ninja;
    {{- end }}
    {{- if (eq $i 3) }}
    server_name *.brawltime.ninja;
    {{- end }}

    location / {
      proxy_pass http://traefik;
      proxy_set_header Host $http_host;

      add_header X-Proxy-Cache $upstream_cache_status;
      proxy_cache main-cache;
      proxy_cache_use_stale error timeout invalid_header updating http_500 http_502 http_503 http_504 http_429; # serve from cache instead
      proxy_cache_revalidate on; # use conditional requests
      proxy_cache_background_update on; # serve stale, update in background
      proxy_cache_lock on; # update cache using a single request, stalling others
      proxy_http_version 1.1;
      proxy_set_header Connection "";
    }
  }
  {{- end }}
}
