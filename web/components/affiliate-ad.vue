<template>
  <a
    :href="`https://www.eneba.com/top-up-brawl-stars-gems-global?af_id=${enebaId}`"
    rel="noopener noreferrer nofollow sponsored"
    target="_blank"
  >
    <img
      v-observe-visibility="{
        callback: makeVisibilityCallback('horizontal-banner'),
        once: true,
      }"
      :src="HorizontalBanner"
      class="aspect-video w-full max-w-md"
      alt="Eneba Affiliate Banner"
      @click="trackInteraction('horizontal-banner')"
    />
  </a>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { ObserveVisibility } from 'vue-observe-visibility'
import VerticalBanner from '~/assets/images/ads/EN_STR_BRAWL.png'
import HorizontalBanner from '~/assets/images/ads/EN_TW_BRAWL.png'
import { useConfig } from '~/composables/compat'
import { useTrackScroll } from '~/composables/gtag'

export default defineComponent({
  directives: {
    ObserveVisibility,
  },
  setup() {
    const { makeVisibilityCallback, trackInteraction } = useTrackScroll('affiliate-ad')
    const $config = useConfig()
    const enebaId = computed(() => $config.enebaId)

    return {
      VerticalBanner,
      HorizontalBanner,
      makeVisibilityCallback,
      trackInteraction,
      enebaId,
    }
  },
})
</script>
