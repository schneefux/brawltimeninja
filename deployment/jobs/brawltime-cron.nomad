job "brawltime-cron" {
  datacenters = ["dc1"]
  type = "batch"

  priority = 10

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
          "-H", "Host: brawltime.ninja",
          "-v",
          "-k",
          "https://10.0.0.2/api/cron"
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
