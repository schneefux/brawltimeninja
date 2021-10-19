#cloud-config
runcmd:
  - sed -i -e '/^\(#\|\)PasswordAuthentication/s/^.*$/PasswordAuthentication no/' /etc/ssh/sshd_config
  - sed -i "s,INTERFACE,$(ip link show | grep -oP 'en.+(?=:)'),g" /etc/nomad.d/nomad.hcl
  - mkdir -p /opt/nomad/volumes/certs
  - chown -R nomad:nomad /opt/nomad/volumes
  - systemctl stop systemd-resolved
  - systemctl disable systemd-resolved
  - systemctl enable nomad consul dnsmasq
  - systemctl start nomad consul dnsmasq
  - DD_AGENT_MAJOR_VERSION=7 DD_API_KEY=${datadog_api_key} DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
  - usermod -a -G docker dd-agent
  - "echo \"dogstatsd_non_local_traffic: true\napm_config:\n  apm_non_local_traffic: true\" >> /etc/datadog-agent/datadog.yaml"
  - systemctl restart datadog-agent
apt:
  sources:
    hashicorp:
      source: "deb [arch=amd64] https://apt.releases.hashicorp.com $RELEASE main"
      keyid: E8A032E094D8EB4EA189D270DA418C88A3219F7B
packages:
  - apt-transport-https
  - nomad
  - consul
  - dnsmasq
  - mariadb-client
  - jq
write_files:
  - path: /etc/dnsmasq.conf
    content: |
      local-service
      no-resolv
      server=/consul/127.0.0.1#8600
      server=185.12.64.1
      server=185.12.64.2
      address=/brawltime.ninja/${leader_ip}
      cache-size=65536
  - path: /etc/nomad.d/nomad.hcl
    content: |
      advertise {
        http = "${ip}"
        rpc = "${ip}"
        serf = "${ip}"
      }
      datacenter = "dc1"
      data_dir = "/opt/nomad"

      ${ class == "ingress" ? <<-EOF
      server {
        enabled = true
        bootstrap_expect = 1
      }
      EOF
      : "" ~}

      client {
        enabled = true
        network_interface = "INTERFACE"

        host_volume "certs" {
          path = "/opt/nomad/volumes/certs"
          read_only = false
        }

        reserved {
          reserved_ports = "22"
        }

        node_class = "${class}"
      }

      plugin "docker" {
        config {
          allow_privileged = true
        }
      }

      telemetry {
        publish_allocation_metrics = true
        publish_node_metrics = true
        datadog_address = "localhost:8125"
        disable_hostname = true
        collection_interval = "10s"
      }
  - path: /etc/consul.d/consul.hcl
    content: |
      advertise_addr = "${ip}"
      client_addr = "0.0.0.0"
      datacenter = "dc1"
      data_dir = "/opt/consul"

      ui_config {
        enabled = true
      }

      ${ class == "ingress" ? <<-EOF
      server = true
      bootstrap_expect = 1
      EOF
      : "" ~}

      retry_join = ["${leader_ip}"]
