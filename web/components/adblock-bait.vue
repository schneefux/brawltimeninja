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
import { set as gtagSet } from 'vue-gtag'

export default defineComponent({
  setup() {
    const adblockBait = ref<HTMLElement>()

    onMounted(() => {
      const adsBlocked = adblockBait.value!.clientHeight === 0;

      (gtagSet as any)('user_properties', {
        'ads_blocked': adsBlocked.toString(),
      })
    })

    return {
      adblockBait,
    }
  },
})
</script>
