<template>
  <div
    ref="adblock-bait"
    class="absolute bottom-0 left-0"
  >
    <div class="adBanner w-px h-px bg-transparent"></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  mounted() {
    const adsBlocked = (<any>this.$refs['adblock-bait']).clientHeight === 0
    this.$gtag.event('ads_blocked_dimension', {
      'ads_blocked': adsBlocked,
      'non_interaction': true,
    })

    this.$gtag.event('blocked', {
      'event_category': 'ads',
      'event_label': adsBlocked.toString(),
      'value': adsBlocked ? 1 : 0,
      'non_interaction': true,
    })
  },
})
</script>
