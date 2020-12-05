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
    this.$ga.set('dimension2', !adsBlocked)
    this.$ga.event('ads', 'blocked', adsBlocked.toString(), <any>{ nonInteraction: true })
  },
})
</script>
