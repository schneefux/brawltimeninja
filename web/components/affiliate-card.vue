<template>
  <b-card
    v-observe-visibility="{
      callback: makeVisibilityCallback('card'),
      once: true,
    }"
    :icon="GemsPack"
    title="Offer: Gems and Brawl Pass"
    class="w-full max-w-md"
  >
    <template v-slot:content>
      <p class="prose dark:prose-invert">
        Buy Gems and Brawl Pass cheaper via eneba to support Brawl Time Ninja!<br/>
        Use Code: <span class="text-primary-500">BRAWLNINJA</span> for a discount.
      </p>
    </template>
    <template v-slot:actions>
      <b-button
        :href="`https://www.eneba.com/landing/brawl-stars?af_id=${enebaId}`"
        tag="a"
        rel="noopener noreferrer nofollow sponsored"
        target="_blank"
        primary
        md
        @click="trackInteraction('card')"
      >
        {{ $t('action.open') }}
      </b-button>
    </template>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { ObserveVisibility } from 'vue-observe-visibility'
import GemsPack from '~/assets/images/ads/gems_pack_0170.png'
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
      GemsPack,
      makeVisibilityCallback,
      trackInteraction,
      enebaId,
    }
  },
})
</script>
