<template>
  <div
    ref="adblockBait"
    class="absolute bottom-0 left-0"
  >
    <div class="adBanner w-px h-px bg-transparent"></div>
  </div>
</template>

<script lang="ts">
import { ref, wrapProperty, defineComponent, onMounted } from '@nuxtjs/composition-api'

const useGtag = wrapProperty('$gtag', false)
export default defineComponent({
  setup() {
    const gtag = useGtag()
    const adblockBait = ref<HTMLElement>()

    onMounted(() => {
      const adsBlocked =adblockBait.value!.clientHeight === 0
      gtag.event('ads_blocked_dimension', {
        'ads_blocked': adsBlocked,
        'non_interaction': true,
      })

      gtag.event('blocked', {
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
