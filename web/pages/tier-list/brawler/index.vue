<template>
  <page :title="$t('tier-list.brawler.title')">
    <p class="mt-4 prose prose-invert">
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

    <page-section
      :title="$t('tier-list.all.title')"
      tracking-id="widget"
      tracking-page-id="brawler_meta"
    >
      <map-views
        ga-category="brawler"
      ></map-views>
    </page-section>

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
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  head() {
    const description = this.$t('tier-list.brawlers.meta.description') as string
    return {
      title: this.$t('tier-list.brawlers.meta.title') as string,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    title: 'Brawlers',
    screen: 'brawlers',
  },
  middleware: ['cached'],
  computed: {
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string): void {
      if (visible) {
        this.$gtag.event('scroll', {
          'event_category': 'brawler_meta',
          'event_label': section,
        })
      }
    },
  },
})
</script>
