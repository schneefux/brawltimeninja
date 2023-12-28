variable "hcloud_token" {}
variable "ssh_public_key_name" {}
variable "datadog_api_key" {}
variable "brawltime_net_id" {}

job "autoscaler" {
  datacenters = ["dc1"]

  priority = 40

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
        image = "hashicorp/nomad-autoscaler:0.4.0"
        entrypoint = []
        command = "/bin/sh"
        ports = ["http"]

        args = [
          "-c",
          "-x",
          "mkdir -p ${NOMAD_TASK_DIR}/plugins && cp ${NOMAD_TASK_DIR}/hcloud-server ${NOMAD_TASK_DIR}/plugins/hcloud-server && chmod +x ${NOMAD_TASK_DIR}/plugins/hcloud-server && nomad-autoscaler agent -config ${NOMAD_TASK_DIR}/config.hcl -plugin-dir ${NOMAD_TASK_DIR}/plugins -policy-dir ${NOMAD_TASK_DIR}/policies -http-bind-address 0.0.0.0 -http-bind-port ${NOMAD_PORT_http}",
        ]
      }

      artifact {
        source = "https://github.com/AndrewChubatiuk/nomad-hcloud-autoscaler/releases/download/v0.1.1/hcloud-server"
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

          log_level = "INFO"
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
            max = 14

            policy {
              # servers are paid by hour (rounded up) so keep it for a while
              cooldown = "30m"
              # wait until new server is up before re-evaluation
              # TODO if the plugin cannot detect that the server is up,
              # it will keep creating new ones
              evaluation_interval = "10m"

              check "high_node-cpu" {
                source = "nomad-apm"
                query = "percentage-allocated_cpu"
                group = "cpu-allocated"
                query_window = "10m"

                strategy "threshold" {
                  upper_bound = 100
                  lower_bound = 80
                  within_bounds_trigger = 1
                  delta = 1
                }
              }

              check "low_node-cpu" {
                source = "nomad-apm"
                query = "percentage-allocated_cpu"
                group = "cpu-allocated"
                query_window = "10m"

                strategy "threshold" {
                  upper_bound = 50
                  lower_bound = 0
                  within_bounds_trigger = 1
                  delta = -1
                }
              }

              check "high_node-memory" {
                source = "nomad-apm"
                query = "percentage-allocated_memory"
                group = "memory-allocated"
                query_window = "10m"

                strategy "threshold" {
                  upper_bound = 100
                  lower_bound = 80
                  within_bounds_trigger = 1
                  delta = 1
                }
              }

              check "low_node-memory" {
                source = "nomad-apm"
                query = "percentage-allocated_memory"
                group = "memory-allocated"
                query_window = "10m"

                strategy "threshold" {
                  upper_bound = 50
                  lower_bound = 0
                  within_bounds_trigger = 1
                  delta = -1
                }
              }

              # sync with hetzner.tf
              target "hcloud-server" {
                # combined filters are only supported since Nov 2021 https://github.com/hashicorp/nomad-autoscaler/pull/535
                # the plugin was built Feb 2021
                # scale-in will not work with this line uncommented
                #datacenter = "dc01"
                node_class = "worker"
                node_purge = "true"
                #dry-run = "true"
                hcloud_location = "nbg1"
                hcloud_image = "docker-ce"
                hcloud_group_id = "autoscale"
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
                # scaling-intensive services (web, cube, render) have a 1:2 RAM:CPU ratio, so pick cpx11
                # TODO ARM only in fsn1, no CPU frequency for ARM - unusable
                hcloud_server_type = "cpx11"
                hcloud_labels = "firewall=true,nomad_class=worker"
                # id of hetzner network brawltime-net
                hcloud_networks = "${var.brawltime_net_id}"
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
        cpu = 64
        memory = 64
        memory_max = 128
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
