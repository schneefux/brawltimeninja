job "brawltime-cron" {
  datacenters = ["dc1"]
  type = "batch"

  periodic {
    cron = "@hourly"
    prohibit_overlap = true
  }

  group "brawltime-cron" {
    task "cron" {
      driver = "exec"

      config {
        command = "/usr/bin/curl"
        args = [
          "-X", "POST",
          "https://brawltime.ninja/api/cron"
        ]
      }

      resources {
        cpu = 32
        memory = 32
        memory_max = 256
      }
    }
  }
}
