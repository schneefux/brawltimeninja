<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">{{ brawlerName }}</h1>
    </div>

    <div class="section flex flex-wrap justify-center">
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
        <nuxt-link
          class="button md:button--md button--secondary"
          to="/tier-list/starpowers"
        >
          Open Star Power Tier List
        </nuxt-link>

        <nuxt-link
          class="button md:button--md ml-3 button--secondary"
          to="/tier-list/gadgets"
        >
          Open Gadget Tier List
        </nuxt-link>
      </div>
    </div>

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

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'synergies'),
        once: true,
      }"
    >
      <h2 class="page-h2">
        Synergies for {{ brawlerName }}
      </h2>
    </div>

    <div class="section">
      <div class="flex justify-center">
        <brawler-synergies-card
          :brawler="brawlerName"
        ></brawler-synergies-card>
      </div>
    </div>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'current-maps'),
        once: true,
      }"
    >
      <h2 class="page-h2">
        Current Maps for {{ brawlerName }}
      </h2>
    </div>

    <div class="section">
      <brawler-active-events
        :show-all-maps="showAllMaps"
        :brawler-name="brawlerName"
      ></brawler-active-events>

      <div class="mt-1 w-full flex justify-end">
        <button
          @click="showAllMaps = true"
          :class="{ 'md:block': !showAllMaps }"
          class="mr-3 button md:button--md button--secondary hidden"
        >
          Show More
        </button>
        <nuxt-link
          class="button md:button--md button--secondary"
          to="/tier-list/map"
        >
          Open Map Tier Lists
        </nuxt-link>
      </div>
    </div>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'trends'),
        once: true,
      }"
    >
      <h2 class="page-h2">
        {{ brawlerName }} Trends
      </h2>
      <p>
        See how {{ brawlerName }} has performed this month.
      </p>
    </div>

    <div class="section">
      <brawler-trends-card
        :brawler="brawlerName"
      ></brawler-trends-card>
    </div>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'trophy-graphs'),
        once: true,
      }"
    >
      <h2 class="page-h2">
        {{ brawlerName }} Statistics by Trophies
      </h2>
    </div>

    <div class="section">
      <brawler-trophy-graphs
        :brawler-name="brawlerName"
      ></brawler-trophy-graphs>

      <p class="mt-4">
        Info:
        Statistics are generated with data from Brawl Time Ninja's visitors.
        These players are usually better than the average.
      </p>

      <div class="mt-1 w-full flex justify-end">
        <nuxt-link
          class="button md:button--md button--secondary"
          to="/tier-list/brawler"
        >
          Open Brawler Tier List
        </nuxt-link>
      </div>
    </div>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'modes'),
        once: true,
      }"
    >
      <h2 class="page-h2">
        Best Modes for {{ brawlerName }}
      </h2>
    </div>

    <div class="section">
      <brawler-modes-stats
        :brawler-id="brawlerId"
        :brawler-name="brawlerName"
        :show-all-modes="showAllModes"
      ></brawler-modes-stats>

      <p class="mt-2">
        Info:
        A Brawler is considered viable on a map if the Brawler has an above average number of wins on that map.
      </p>

      <div class="mt-1 w-full flex justify-end">
        <button
          @click="showAllModes = true"
          :class="{ 'md:block': !showAllModes }"
          class="mr-3 button md:button--md button--secondary hidden"
        >
          Show More
        </button>
        <nuxt-link
          class="button md:button--md button--secondary"
          to="/tier-list/mode"
        >
          Open Mode Tier Lists
        </nuxt-link>
      </div>
    </div>

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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaInfo } from 'vue-meta'
import { capitalize, capitalizeWords, metaStatMaps } from '../../../lib/util'
import { ModeMetaMap, MapMetaMap } from '../../../model/MetaEntry'
import { BrawlerStatisticsRows } from '../../../model/Clicker'
import { ActiveEvent, CurrentAndUpcomingEvents } from '../../../model/Api'

export default Vue.extend({
  head(): MetaInfo {
    const description = `${this.brawlerName} Brawl Stars stats. Best Star Power and best Gadget for ${this.brawlerName} with win rate and pick rates for all modes.`
    return {
      title: `${this.brawlerName} in Brawl Stars`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      brawlerId: '',
      brawlerName: '',
      showAllModes: false,
      showAllMaps: false,
      capitalize,
      metaStatMaps,
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
        this.$ga.event('brawler', 'scroll', section)
      }
    },
  },
})
</script>
