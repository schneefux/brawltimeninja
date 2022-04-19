variable "hcloud_token" {}
variable "ssh_public_key_name" {}
variable "datadog_api_key" {}

job "autoscaler" {
  datacenters = ["dc1"]

  affinity {
    attribute = "${node.class}"
    value = "ingress"
  }

  group "autoscaler" {
    network {
      port "http" {}
    }


    task "autoscaler" {
      driver = "docker"

      config {
        # artifacts are owned by nobody and nomad-hcloud-autoscaler misses the x flag
        # copy the artifact, chmod it, then start the agent
        # workaround for https://github.com/hashicorp/nomad/issues/2625
        image = "hashicorp/nomad-autoscaler:0.3.6"
        command = "/bin/sh"
        ports = ["http"]

        args = [
          "-c",
          "mkdir -p ${NOMAD_TASK_DIR}/plugins && cp ${NOMAD_TASK_DIR}/nomad-hcloud-autoscaler ${NOMAD_TASK_DIR}/plugins/hcloud-server && chmod +x ${NOMAD_TASK_DIR}/plugins/hcloud-server && nomad-autoscaler agent -config ${NOMAD_TASK_DIR}/config.hcl -plugin-dir ${NOMAD_TASK_DIR}/plugins -policy-dir ${NOMAD_TASK_DIR}/policies -http-bind-address 0.0.0.0 -http-bind-port ${NOMAD_PORT_http}",
        ]
      }

      artifact {
        source = "https://github.com/AndrewChubatiuk/nomad-hcloud-autoscaler/releases/download/v0.0.2/nomad-hcloud-autoscaler"
      }

      template {
        data = <<-EOF
          nomad {
            address = "http://{{ env "attr.unique.network.ip-address" }}:4646"
          }

          telemetry {
            dogstatsd_address = "localhost:8125"
            disable_hostname = true
            collection_interval = "10s"
          }

          apm "nomad-apm" {
            driver = "nomad-apm"
          }

          strategy "target-value" {
            driver = "target-value"
          }

          strategy "threshold" {
            driver = "threshold"
          }

          target "hcloud-server" {
            driver = "hcloud-server"
            config = {
              hcloud_token = "${var.hcloud_token}"
            }
          }

          policy {
            default_cooldown = "5m"
            # reduce load on Nomad and slow down scaling
            default_evaluation_interval = "1m"
          }
        EOF

        destination = "${NOMAD_TASK_DIR}/config.hcl"
        change_mode = "signal"
        change_signal = "SIGHUP"
      }

      template {
        data = <<-EOF
          scaling "hetzner-workers" {
            enabled = true
            min = 1
            max = 8

            policy {
              # servers are paid by hour (rounded up) so keep it for a while
              cooldown = "30m"
              # wait until new server is up before re-evaluation
              # TODO if the plugin cannot detect that the server is up,
              # it will keep creating new ones
              evaluation_interval = "10m"

              # TODO checks also takes database/ingress allocations into account
              check "node-cpu" {
                source = "nomad-apm"
                query = "percentage-allocated_cpu"

                strategy "target-value" {
                  target = 80
                }
              }

              check "node-memory" {
                source = "nomad-apm"
                query = "percentage-allocated_memory"

                strategy "target-value" {
                  target = 80
                }
              }

              # sync with hetzner.tf
              target "hcloud-server" {
                # combined filters are only supported since Nov 2021 https://github.com/hashicorp/nomad-autoscaler/pull/535
                # the plugin was built Feb 2021
                #datacenter = "dc01"
                node_class = "worker"
                node_purge = "true"
                dry-run = "true"
                hcloud_location = "nbg1"
                hcloud_image = "docker-ce"
                hcloud_user_data = <<-EOOF
                  ${
                    regex_replace(
                      regex_replace(
                        file("../infra/conf/cloudinit-worker.yml.tpl"), "\\${datadog_api_key}", "${var.datadog_api_key}"
                      ), "\\${class}", "worker"
                    )
                  }
                EOOF
                hcloud_ssh_keys = "${var.ssh_public_key_name}"
                hcloud_server_type = "cpx11"
                hcloud_name_prefix = "brawltime"
                hcloud_labels = "firewall=true,nomad_class=worker"
                hcloud_networks = "brawltime-net"
              }
            }
          }
        EOF
        destination = "${NOMAD_TASK_DIR}/policies/hcloud.hcl"
        left_delimiter = "DISABLE"
        right_delimiter = "DISABLE"
        change_mode = "signal"
        change_signal = "SIGHUP"
      }

      resources {
        cpu = 50
        memory = 128
      }

      service {
        name = "autoscaler"
        port = "http"

        check {
          type = "http"
          path = "/v1/health"
          interval = "10s"
          timeout = "2s"
        }
      }
    }
  }
}
