<template>
  <div
    ref="adblockBait"
    class="absolute bottom-0 left-0"
  >
    <div class="adBanner w-px h-px bg-transparent"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, useTemplateRef } from 'vue'
import { set as gtagSet } from 'vue-gtag'

export default defineComponent({
  setup() {
    const adblockBaitRef = useTemplateRef<HTMLElement>('adblockBait')

    onMounted(() => {
      const adsBlocked = adblockBaitRef.value!.clientHeight === 0;

      (gtagSet as any)('user_properties', {
        'ads_blocked': adsBlocked.toString(),
      })
    })
  },
})
</script>
