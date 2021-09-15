#cloud-config
runcmd:
  - sed -i -e '/^\(#\|\)PasswordAuthentication/s/^.*$/PasswordAuthentication no/' /etc/ssh/sshd_config
  - systemctl enable nomad consul
  - systemctl start nomad consul
apt:
  sources:
    hashicorp:
      source: "deb [arch=amd64] https://apt.releases.hashicorp.com $RELEASE main"
      keyid: E8A032E094D8EB4EA189D270DA418C88A3219F7B
packages:
  - nomad
  - consul
write_files:
  - path: /etc/nomad.d/nomad.hcl
    content: |
      advertise {
        http = "${bind_ip}"
        rpc = "${bind_ip}"
        serf = "${bind_ip}"
      }
      datacenter = "dc1"
      data_dir = "/opt/nomad"

      ${ leader ? <<EOT
      server {
        enabled = true
        bootstrap_expect = 1
      }
      EOT
      : "" }

      client {
        enabled = true
      }

      plugin "docker" {
        config {
          allow_privileged = true
        }
      }
  - path: /etc/consul.d/consul.hcl
    content: |
      advertise_addr = "${bind_ip}"
      datacenter = "dc1"
      data_dir = "/opt/consul"

      ui_config {
        enabled = true
      }

      ${ leader ? <<EOT
      server = true
      bootstrap_expect = 1
      EOT
      : "" }

      retry_join = ["${leader_ip}"]
