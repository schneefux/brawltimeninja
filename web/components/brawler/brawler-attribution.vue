<template>
  <b-card :title="$t('attribution.title')">
    <i18n
      slot="content"
      path="fandom-attribution"
      tag="p"
    >
      <template v-slot:link>
        <a
          v-if="scrapedData != undefined"
          :href="scrapedData.url"
          target="_blank"
          rel="nofollow noopener noreferrer"
          class="underline cursor-pointer"
        >“{{ scrapedData.name }}”</a>
      </template>
      <template v-slot:license>
        <a
          href="https://www.fandom.com/licensing"
          target="_blank"
          rel="license nofollow noopener noreferrer"
          class="underline cursor-pointer"
        >Creative Commons Attribution-Share Alike License</a>
      </template>
    </i18n>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { BCard } from '@schneefux/klicker/components'
import { ScrapedBrawler } from '~/model/Web'

export default defineComponent({
  components: {
    BCard,
  },
  props: {
    scrapedData: {
      type: Object as PropType<ScrapedBrawler>,
      required: false
    },
  },
})
</script>