#cloud-config
runcmd:
  - sed -i -e '/^\(#\|\)PasswordAuthentication/s/^.*$/PasswordAuthentication no/' /etc/ssh/sshd_config
  - systemctl enable nomad consul
  - systemctl start nomad consul
  # https://learn.hashicorp.com/tutorials/consul/dns-forwarding#systemd-resolved-setup
  - iptables --table nat --append OUTPUT --destination localhost --protocol udp --match udp --dport 53 --jump REDIRECT --to-ports 8600
  - iptables --table nat --append OUTPUT --destination localhost --protocol tcp --match tcp --dport 53 --jump REDIRECT --to-ports 8600
  - systemctl restart systemd-resolved
apt:
  sources:
    hashicorp:
      source: "deb [arch=amd64] https://apt.releases.hashicorp.com $RELEASE main"
      keyid: E8A032E094D8EB4EA189D270DA418C88A3219F7B
packages:
  - nomad
  - consul
  - mariadb-client
write_files:
  - path: /etc/systemd/resolved.conf
    content: |
      [Resolve]
      DNS=127.0.0.1
      Domains=~consul
  - path: /etc/nomad.d/nomad.hcl
    content: |
      advertise {
        http = "${bind_ip}"
        rpc = "${bind_ip}"
        serf = "${bind_ip}"
      }
      datacenter = "dc1"
      data_dir = "/opt/nomad"

      ${ leader ? <<EOF
      server {
        enabled = true
        bootstrap_expect = 1
      }
      EOF
      : "" }

      client {
        enabled = true
        network_interface = "ens10"
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

      ${ leader ? <<EOF
      server = true
      bootstrap_expect = 1
      EOF
      : "" }

      retry_join = ["${leader_ip}"]
