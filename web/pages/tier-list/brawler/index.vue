<template>
  <page title="Brawl Stars Brawler Tier List">
    <p>Brawler Tier Lists are generated automatically for all Brawlers in Brawl Stars.</p>

    <div class="flex flex-wrap justify-center">
      <div
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'gadgets'),
          once: true,
        }"
      >
        <best-starpowers-card
          kind="starpowers"
        ></best-starpowers-card>

        <best-starpowers-card
          kind="gadgets"
        ></best-starpowers-card>
      </div>

      <map-detail-card
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'widget'),
          once: true,
        }"
        title="State of the Brawl Stars Meta"
      >
        <b-button
          slot="actions"
          to="/tier-list/history"
          primary
          prefetch
        >Open Time Capsule</b-button>
      </map-detail-card>
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
      title="Tier List for all Maps and Modes"
      tracking-id="widget"
      tracking-page-id="brawler_meta"
    >
      <map-meta-table></map-meta-table>
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
    const description = 'Brawl Stars Brawler Tier List. Find the best Brawlers. View Win Rates and Rankings.'
    return {
      title: 'Brawler Tier List',
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
