job "docs" {
  datacenters = ["dc1"]

  group "example" {
    network {
      port "http" {}
    }

    service {
      name = "echo"
      port = "http"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.http.rule=Path(`/myapp`)",
      ]

      check {
        type = "http"
        path = "/"
        interval = "2s"
        timeout = "2s"
      }
    }

    task "server" {
      driver = "docker"

      config {
        image = "hashicorp/http-echo"
        ports = ["http"]
        args = [
          "-listen",
          ":${NOMAD_PORT_http}",
          "-text",
          "hello world",
        ]
      }
    }
  }
}
