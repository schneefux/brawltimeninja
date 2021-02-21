<template>
  <page :title="brawlerName">
    <map-breadcrumbs
      :brawler-id="brawlerId"
      :brawler-name="brawlerName"
    ></map-breadcrumbs>

    <page-section>
      <div class="flex flex-wrap justify-center">
        <brawler-base-stats
          :brawler-id="brawlerId"
          :brawler-name="brawlerName"
        ></brawler-base-stats>

        <brawler-starpower-stats
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'starpowers'),
            once: true,
          }"
          :brawler-id="brawlerId"
          :brawler-name="brawlerName"
          kind="starpowers"
        ></brawler-starpower-stats>

        <brawler-starpower-stats
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'gadgets'),
            once: true,
          }"
          :brawler-id="brawlerId"
          :brawler-name="brawlerName"
          kind="gadgets"
        ></brawler-starpower-stats>

        <p class="mt-4">
          Info:
          Star Power and Gadget statistics are calculated as the difference between a Brawler with one Star Power or Gadget and a Brawler with zero Star Powers or Gadgets.
        </p>

        <div class="mt-2 w-full flex justify-end">
          <b-button
            to="/tier-list/starpowers"
            primary
            sm
            prefetch
          >
            {{ $t('action.open.thing', { thing: $tc('thing.tier-list.thing', 1, { thing: $tc('thing.starpower', 2) }) }) }}
          </b-button>

          <b-button
            class="ml-3"
            to="/tier-list/gadgets"
            primary
            sm
            prefetch
          >
            {{ $t('action.open.thing', { thing: $tc('thing.tier-list.thing', { thing: $tc('thing.gadget', 2) }) }) }}
          </b-button>
        </div>
      </div>
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

      <div class="mt-1 w-full flex justify-end">
        <b-button
          @click="showAllMaps = true"
          :class="{ 'md:block': !showAllMaps }"
          class="mr-3 hidden"
          sm
          primary
        >
          {{ $t('action.expand') }}
        </b-button>
        <b-button
          to="/tier-list/map"
          sm
          primary
          prefetch
        >
          {{ $t('action.open.thing', { thing: $tc('thing.tier-list.thing', 1, { thing: $tc('thing.map', 1) }) }) }}
        </b-button>
      </div>
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
        :brawler="brawlerName"
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

      <p class="mt-4">
        {{ $t('brawler.disclaimer') }}
      </p>

      <div class="mt-1 w-full flex justify-end">
        <b-button
          to="/tier-list/brawler"
          primary
          sm
          prefetch
        >
          {{ $t('action.open.thing', { thing: $tc('thing.tier-list.thing', 1, { thing: $tc('thing.brawler', 1) }) }) }}
        </b-button>
      </div>
    </page-section>

    <page-section
      :title="'Best Modes for ' + brawlerName"
      tracking-id="modes"
      tracking-page-id="brawler"
    >
      <brawler-modes-stats
        :brawler-id="brawlerId"
        :brawler-name="brawlerName"
        :show-all-modes="showAllModes"
      ></brawler-modes-stats>

      <p class="mt-2">
        {{ $t('brawler.viable-info') }}
      </p>

      <div class="mt-1 w-full flex justify-end">
        <b-button
          @click="showAllModes = true"
          :class="{ 'md:block': !showAllModes }"
          class="mr-3 hidden"
          sm
          primary
        >
          {{ $t('action.expand') }}
        </b-button>
      </div>
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
    const description = this.$tc('tier-list.brawler.description', 1, { brawler: this.brawlerName })
    return {
      title: this.$tc('tier-list.brawler.title', 1, { brawler: this.brawlerName }),
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  middleware: ['cached'],
  data() {
    return {
      brawlerId: '',
      brawlerName: '',
      showAllModes: false,
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
