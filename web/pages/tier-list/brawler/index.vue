<template>
  <b-page :title="$t('tier-list.brawler.title')">
    <p class="mt-4 prose dark:prose-invert">
      {{ $t('tier-list.brawler.description') }}
    </p>

    <client-only>
      <adsense
        v-if="!isApp"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6446102315"
        data-ad-format="auto"
        data-full-width-responsive="yes"
        ins-class="ad-section"
      />
    </client-only>

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

    <client-only>
      <adsense
        v-if="!isApp"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="7838173054"
        data-ad-format="auto"
        data-full-width-responsive="yes"
        ins-class="ad-section"
      />
    </client-only>
  </b-page>
</template>

<script lang="ts">
import { computed, defineComponent, useContext, useMeta, useStore } from '@nuxtjs/composition-api'
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

    const store = useStore<any>()
    const isApp = computed(() => store.state.isApp as boolean)

    const { makeVisibilityCallback } = useTrackScroll('brawler_meta')

    return {
      isApp,
      makeVisibilityCallback,
    }
  },
  meta: {
    title: 'Brawlers',
    screen: 'brawlers',
  },
  middleware: ['cached'],
})
</script>
