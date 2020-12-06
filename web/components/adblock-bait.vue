<template>
  <div ref="adblock-bait">
    <div class="adBanner absolute bottom-0 left-0 w-px h-px bg-transparent">
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  mounted() {
    const adsBlocked = (<any>this.$refs['adblock-bait']).clientHeight === 0
    this.$gtag.customMap({
      'dimension2': (!adsBlocked).toString(),
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
