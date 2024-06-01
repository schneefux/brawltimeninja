<template>
  <b-card :title="$t('prodigy-ad.title')">
    <template v-slot:content>
      <div class="flex">
        <img
          :src="ProdigyLogo"
          class="h-12 md:h-16 my-auto"
        />
        <p class="prose dark:prose-invert">
          {{ $t('prodigy-ad.description') }}
        </p>
      </div>
    </template>
    <template v-slot:actions>
      <b-button
        tag="a"
        href="https://powerleagueprodigy.com/?ref=btn"
        target="_blank"
        rel="sponsored"
        primary
        md
      >
        {{ $t('action.open') }}
      </b-button>
    </template>
  </b-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ProdigyLogo from '~/assets/images/ads/prodigylogo.png'
import { BCard, BButton } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BCard,
    BButton,
  },
  setup() {
    return {
      ProdigyLogo,
    }
  },
})
</script>
