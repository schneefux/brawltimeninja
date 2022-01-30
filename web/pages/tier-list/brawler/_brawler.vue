<template>
  <page :title="brawlerName">
    <breadcrumbs
      :links="[{
        path: '/tier-list/brawler',
        name: $tc('brawler', 2),
      }, {
        path: `/tier-list/brawler/${brawlerId}`,
        name: brawlerName,
      }]"
      class="mt-2"
    ></breadcrumbs>

    <page-section>
      <brawler-base-stats
        :brawler-id="brawlerId"
        :brawler-name="brawlerName"
      ></brawler-base-stats>

      <p class="mt-4 mx-1">
        Info:
        Star Power and Gadget statistics are calculated as the difference between a Brawler with one Star Power or Gadget and a Brawler with zero Star Powers or Gadgets.
      </p>
    </page-section>

    <client-only>
      <adsense
        id="ezoic-pub-ad-placeholder-108"
        ins-class="w-full md:w-1/2 mt-4 mx-auto"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="8533352178"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>

    <page-section
      :title="$t('brawler.synergies-for', { brawler: brawlerName })"
      tracking-id="synergies"
      tracking-page-id="brawler"
    >
      <brawler-synergies-card
        :brawler="brawlerName"
        class="mx-auto"
      ></brawler-synergies-card>
    </page-section>

    <page-section
      :title="$t('brawler.current-maps.title', { brawler: brawlerName })"
      tracking-id="current-maps"
      tracking-page-id="brawler"
    >
      <brawler-active-events
        :show-all-maps="showAllMaps"
        :brawler-name="brawlerName"
      ></brawler-active-events>
    </page-section>

    <page-section
      :title="brawlerName + ' Trends'"
      tracking-id="trends"
      tracking-page-id="brawler"
    >
      <p slot="description">
        {{ $t('brawler.trend.description', { brawler: brawlerName }) }}
      </p>

      <brawler-trends-card
        :brawler-name="brawlerName"
      ></brawler-trends-card>
    </page-section>

    <page-section
      :title="$t('brawler.by-trophies', { brawler: brawlerName })"
      tracking-id="trophy-graphs"
      tracking-page-id="brawler"
    >
      <brawler-trophy-graphs
        :brawler-name="brawlerName"
      ></brawler-trophy-graphs>

      <p class="mt-6 ml-1">
        {{ $t('brawler.disclaimer') }}
      </p>
    </page-section>

    <page-section
      :title="$t('brawler.modes.title', { brawler: brawlerName })"
      tracking-id="modes"
      tracking-page-id="brawler"
    >
      <brawler-modes-stats
        :brawler-id="brawlerId"
        :brawler-name="brawlerName"
      ></brawler-modes-stats>

      <p class="mt-6 mx-1">
        {{ $t('brawler.viable-info') }}
      </p>
    </page-section>

    <client-only>
      <adsense
        v-if="!isApp"
        id="ezoic-pub-ad-placeholder-109"
        ins-class="w-full mt-6 mx-auto h-32"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6837127123"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaInfo } from 'vue-meta'
import { capitalizeWords } from '@/lib/util'

export default Vue.extend({
  head(): MetaInfo {
    const description = this.$t('tier-list.brawler.meta.description', { brawler: this.brawlerName }) as string
    return {
      title: this.$t('tier-list.brawler.meta.title', { brawler: this.brawlerName }) as string,
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
  data() {
    return {
      brawlerId: '',
      brawlerName: '',
      showAllMaps: false,
    }
  },
  computed: {
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  async asyncData({ params }) {
    const brawlerId = params.brawler
    return {
      brawlerId,
      brawlerName: capitalizeWords(brawlerId.replace(/__/g, '. ').replace(/_/g, ' ')), // TODO this does not restore '.' (Mr. P) or '-' (8-Bit)
    }
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string): void {
      if (visible) {
        this.$gtag.event('scroll', {
          'event_category': 'brawler',
          'event_label': section,
        })
      }
    },
  },
})
</script>
