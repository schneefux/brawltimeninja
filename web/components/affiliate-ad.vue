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
  props: {
    siderail: {
      type: Boolean,
      default: false
    },
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

<style lang="postcss" scoped>
.placeholder-takeover {
  margin: 0 auto;
  width: 100%;
  max-width: 336px;
  height: 280px;
}

@media (min-width: 1028px) {
  .placeholder-takeover {
    max-width: 970px;
    height: 250px;
  }
}

.desktop-article {
  margin: 0 auto;
  width: 100%;
  max-width: 970px;
  height: 90px;
}

.mobile-leaderboard {
  margin: 0 auto;
  width: 100%;
  max-width: 320px;
  height: 100px;
}

.placeholder-banner {
  margin: 0 auto;
  width: 100%;
  max-width: 320px;
  height: 100px;
}

@media (min-width: 1028px) {
  .placeholder-banner {
    max-width: 970px;
    height: 90px;
  }
}

.desktop-multileaderboard {
  margin: 0 auto;
  width: 100%;
  max-width: 970px;
  height: 250px;
}

.desktop-side-rail {
  width: 336px;
  height: 600px;
}

.mobile-incontent {
  margin: 0 auto;
  width: 100%;
  max-width: 336px;
  height: 280px;
}

.desktop-incontent {
  margin: 0 auto;
  width: 100%;
  max-width: 728px;
  height: 280px;
}

.placeholder-section {
  margin: 0 auto;
  width: 100%;
  max-width: 336px;
  height: 280px;
}

@media (min-width: 1028px) {
  .placeholder-section {
    max-width: 728px;
    height: 280px;
  }
}
</style>
