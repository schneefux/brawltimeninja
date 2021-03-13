<template>
  <div>
    <p>
      &#169; 2018 - 2021 Brawl Time Ninja
      ({{ releaseVersion }})
    </p>
    <div class="text-center my-1">
      Support me:
      <b-button
        tag="a"
        href="https://discord.gg/uYfgznq"
        class="ml-1"
        secondary
        xs
      >Discord</b-button>
      <b-button
        tag="a"
        href="https://twitter.com/brawltimeninja"
        class="ml-1"
        secondary
        xs
      >Twitter</b-button>
      <b-button
        tag="a"
        href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=Y9TKS7F2E2A2E"
        class="ml-1"
        secondary
        xs
      >PayPal</b-button>
    </div>
    <p class="text-xs leading-tight">
      This content is not affiliated with, endorsed, sponsored, or specifically approved by Supercell and Supercell is not responsible for it. For more information see Supercell's Fan Content Policy: www.supercell.com/fan-content-policy.
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  computed: {
    releaseVersion(): string {
      return process.env.release!
    },
  },
})
</script>
