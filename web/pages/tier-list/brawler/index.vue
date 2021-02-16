<template>
  <page
    :title="$t('tier-list.brawler.title')"
  >
    <p>
      {{ $t('tier-list.brawler.description') }}

      <b-button
        to="/tier-list/history"
        xs
        primary
        prefetch
      >{{ $t('tier-list.open-historical') }}</b-button>
    </p>

    <div class="flex flex-wrap justify-center">
      <best-starpowers-card
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'gadgets'),
          once: true,
        }"
        kind="starpowers"
      ></best-starpowers-card>

      <best-starpowers-card
        kind="gadgets"
      ></best-starpowers-card>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6446102315"
        data-ad-format="auto"
        data-full-width-responsive="yes"
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
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="7838173054"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  head() {
    const description = this.$tc('tier-list.brawlers.meta.description', 1)
    return {
      title: this.$tc('tier-list.brawlers.meta.title', 1),
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    title: 'Brawlers',
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
