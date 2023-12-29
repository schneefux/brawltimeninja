#cloud-config
# sync with cloudinit-*.yml.tpl
runcmd:
  - sed -i -e '/^\(#\|\)PasswordAuthentication/s/^.*$/PasswordAuthentication no/' /etc/ssh/sshd_config
  - mkdir -p /opt/nomad/volumes/certs
  - mkdir -p /opt/nomad/volumes/database
  - chown -R nomad:nomad /opt/nomad/volumes
  - systemctl enable nomad
  - systemctl start nomad
  - DD_AGENT_MAJOR_VERSION=7 DD_API_KEY=${datadog_api_key} DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
  - usermod -a -G docker dd-agent
  - "echo \"dogstatsd_non_local_traffic: true\napm_config:\n  apm_non_local_traffic: true\" >> /etc/datadog-agent/datadog.yaml"
  - systemctl restart datadog-agent
apt:
  sources:
    hashicorp:
      source: "deb https://apt.releases.hashicorp.com $RELEASE main"
      keyid: 798AEC654E5C15428C8E42EEAA16FCBCA621E701
packages:
  - apt-transport-https
  - nomad
  - mariadb-client
  - jq
write_files:
  - path: /etc/nomad.d/nomad.hcl
    content: |
      advertise {
        http = "{{ GetPrivateInterfaces | include \"address\" \"10.0.0.*\" | attr \"address\" }}"
        rpc = "{{ GetPrivateInterfaces | include \"address\" \"10.0.0.*\" | attr \"address\" }}"
        serf = "{{ GetPrivateInterfaces | include \"address\" \"10.0.0.*\" | attr \"address\" }}"
      }
      datacenter = "dc1"
      data_dir = "/opt/nomad"

      consul {
        # do not attempt to sync services with consul
        auto_advertise = false
      }

      server {
        enabled = true
        bootstrap_expect = 3

        server_join {
          retry_join = ["10.0.0.2", "10.0.0.3", "10.0.0.4"]
        }
      }

      client {
        enabled = true
        network_interface = "{{ GetPrivateInterfaces | include \"address\" \"10.0.0.*\" | attr \"name\" }}"

        host_volume "database" {
          path = "/opt/nomad/volumes/database"
          read_only = false
        }

        reserved {
          reserved_ports = "22"
          cpu = 200
          memory = 300
        }

        node_class = "${class}"

        server_join {
          retry_join = ["10.0.0.2", "10.0.0.3", "10.0.0.4"]
        }
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
  # disable userland proxy to (hopefully) fix network issues
  - path: /etc/docker/daemon.json
    content: |
      {
        "userland-proxy": false
      }
