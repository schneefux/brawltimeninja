<template>
  <div
    ref="adblockBait"
    class="absolute bottom-0 left-0"
  >
    <div class="adBanner w-px h-px bg-transparent"></div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted } from 'vue'
import { event } from 'vue-gtag'

export default defineComponent({
  setup() {
    const adblockBait = ref<HTMLElement>()

    onMounted(() => {
      const adsBlocked = adblockBait.value!.clientHeight === 0
      event('ads_blocked_dimension', {
        'ads_blocked': adsBlocked,
        'non_interaction': true,
      })

      event('blocked', {
        'event_category': 'ads',
        'event_label': adsBlocked.toString(),
        'value': adsBlocked ? 1 : 0,
        'non_interaction': true,
      })
    })

    return {
      adblockBait,
    }
  },
})
</script>
