<template>
  <b-page :title="$t('tier-list.brawler.title')">
    <mode-map-jumper></mode-map-jumper>

    <p class="mt-4 prose dark:prose-invert">
      {{ $t('tier-list.brawler.description') }}
    </p>

    <ad
      ad-slot="6446102315"
      first
    ></ad>

    <b-page-section
      :title="$t('tier-list.all.title')"
      v-observe-visibility="{
        callback: makeVisibilityCallback('widget'),
        once: true,
      }"
    >
      <map-views
        ga-category="brawler"
      ></map-views>
    </b-page-section>

    <ad
      ad-slot="7838173054"
      lazy
    ></ad>
  </b-page>
</template>

<script lang="ts">
import { defineComponent, useContext, useMeta } from '@nuxtjs/composition-api'
import { useTrackScroll } from '~/composables/gtag'

export default defineComponent({
  head: {},
  setup() {
    const { i18n } = useContext()

    useMeta(() => {
      const description = i18n.t('tier-list.brawlers.meta.description') as string
      return {
        title: i18n.t('tier-list.brawlers.meta.title') as string,
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
        ]
      }
    })

    const { makeVisibilityCallback } = useTrackScroll('brawler_meta')

    return {
      makeVisibilityCallback,
    }
  },
  middleware: ['cached'],
})
</script>
