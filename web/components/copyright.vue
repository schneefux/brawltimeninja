<template>
  <div>
    <p>
      &#169; 2018 - 2020 Brawl Time Ninja
      ({{ releaseVersion }})
    </p>
    <p>
      Support Me:
      <a class="link" href="https://discord.gg/uYfgznq">Discord</a>
      &mdash;
      <a class="link" href="https://twitter.com/brawltimeninja">Twitter</a>
      &mdash;
      <a class="link" href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=Y9TKS7F2E2A2E">PayPal</a>
    </p>
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
      return (<any>process.env).release
    },
  },
})
</script>
