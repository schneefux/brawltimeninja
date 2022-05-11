<template>
  <b-page :title="$t('brawlers.title')">
    <p class="mt-4 prose dark:prose-invert">
      {{ $t('brawlers.description') }}
    </p>

    <brawlers-roll
      class="mt-8"
    ></brawlers-roll>

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
      <mode-map-jumper></mode-map-jumper>

      <p class="mt-4 prose dark:prose-invert">
        {{ $t('tier-list.brawler.description') }}
      </p>

      <map-views
        ga-category="brawler"
        class="mt-8"
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
import { ObserveVisibility } from 'vue-observe-visibility'
import { useTrackScroll } from '~/composables/gtag'

export default defineComponent({
  directives: {
    ObserveVisibility,
  },
  head: {},
  setup() {
    const { i18n } = useContext()

    useMeta(() => {
      const description = i18n.t('brawlers.meta.description') as string
      return {
        title: i18n.t('brawlers.meta.title') as string,
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
