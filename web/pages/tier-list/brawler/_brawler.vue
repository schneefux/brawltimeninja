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

    <div
      v-if="brawlerData != null"
      class="section flex flex-wrap justify-around"
    >
      <brawler-base-stats
        :brawler-data="brawlerData"
        :brawler-id="brawlerId"
        :brawler-name="brawlerName"
        :stats="stats"
      ></brawler-base-stats>

      <brawler-starpower-stats
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'starpowers'),
          once: true,
        }"
        :brawler-id="brawlerId"
        :descriptions="brawlerData != null ? brawlerData.starpowerDescriptions : null"
        :starpower-meta="starpowerMeta"
        kind="starpowers"
      ></brawler-starpower-stats>

      <brawler-starpower-stats
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'gadgets'),
          once: true,
        }"
        :brawler-id="brawlerId"
        :descriptions="brawlerData != null ? brawlerData.gadgetDescriptions : null"
        :starpower-meta="gadgetMeta"
        kind="gadgets"
      ></brawler-starpower-stats>

      <p class="mt-4">
        Info:
        Star Power statistics are calculated as the difference between a Brawler with one Star Power and a Brawler with zero Star Powers.
        Gadget statistics are calculated as the difference between a Brawler with one Gadget and a Brawler with zero Gadgets.
      </p>

      <div class="mt-2 w-full flex justify-end">
        <nuxt-link
          class="button md:button-md"
          to="/tier-list/starpowers"
        >
          Open Star Power Tier List
        </nuxt-link>

        <nuxt-link
          class="button md:button-md ml-3"
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
        data-full-width-responsive
      />
    </client-only>

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
        :active-events="activeEvents.current"
        :map-meta="mapMeta"
        :brawler-id="brawlerId"
        :show-all-maps="showAllMaps"
        :total-brawlers="totalBrawlers"
      ></brawler-active-events>

      <div class="mt-1 w-full flex justify-end">
        <button
          @click="showAllMaps = true"
          :class="{ 'md:block': !showAllMaps }"
          class="mr-3 button md:button-md hidden"
        >
          Show More
        </button>
        <nuxt-link
          class="button md:button-md"
          to="/tier-list/map"
        >
          Open Map Tier Lists
        </nuxt-link>
      </div>
    </div>

    <div
      class="section-heading"
      v-if="brawlerStats != null"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'trophy-graphs'),
        once: true,
      }"
    >
      <h2 class="page-h2">
        {{ brawlerName }} Statistics by Trophies
      </h2>
    </div>

    <div
      v-if="brawlerStats != null"
      class="section"
    >
      <brawler-trophy-graphs
        :brawler-stats="brawlerStats"
        :total-brawlers="totalBrawlers"
      ></brawler-trophy-graphs>

      <p class="mt-4">
        Info:
        Statistics are generated with data from Brawl Time Ninja's visitors.
        These players are usually better than the average.
      </p>

      <div class="mt-1 w-full flex justify-end">
        <nuxt-link
          class="button md:button-md"
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
      <brawler-mode-stats
        :mode-meta="modeMeta"
        :map-meta="mapMeta"
        :brawler-id="brawlerId"
        :show-all-modes="showAllModes"
      ></brawler-mode-stats>

      <div class="mt-1 w-full flex justify-end">
        <button
          @click="showAllModes = true"
          :class="{ 'md:block': !showAllModes }"
          class="mr-3 button md:button-md hidden"
        >
          Show More
        </button>
        <nuxt-link
          class="button md:button-md"
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
        data-full-width-responsive
      />
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { capitalize, capitalizeWords, metaStatMaps } from '../../../lib/util'
import { ModeMetaMap, MapMetaMap } from '../../../model/MetaEntry'
import { BrawlerStatisticsRows } from '../../../model/Clicker'
import { StarpowerMetaStatistics, GadgetMetaStatistics, BrawlerMetaStatistics } from '../../../model/Api'
import { BrawlerData } from '../../../model/Media'
import { ActiveEvent } from '../../../model/Brawlstars'

export default Vue.extend({
  name: 'BrawlerPage',
  head() {
    const description = `${(<any>this).brawlerName} Brawl Stars stats. Best Star Power and best Gadget for ${(<any>this).brawlerName} with win rate and pick rates for all modes.`
    return {
      title: `${(<any>this).brawlerName} Statistics`,
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
      activeEvents: [] as ActiveEvent[],
      brawlerMeta: [] as BrawlerMetaStatistics[],
      starpowerMeta: [] as StarpowerMetaStatistics[],
      gadgetMeta: [] as GadgetMetaStatistics[],
      modeMeta: {} as ModeMetaMap,
      mapMeta: {} as MapMetaMap,
      brawlerStats: null as BrawlerStatisticsRows|null,
      brawlerData: null as BrawlerData|null,
      showAllModes: false,
      showAllMaps: false,
      capitalize,
      metaStatMaps,
    }
  },
  computed: {
    stats(): BrawlerMetaStatistics|undefined {
      return this.brawlerMeta.find(entry => entry.id == this.brawlerId)
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers as number,
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  async asyncData({ params, $axios, error }) {
    const brawlerId = params.brawler
    const activeEvents = await $axios.$get('/api/events/active') as ActiveEvent[]
    const brawlerMeta = await $axios.$get('/api/meta/brawler') as BrawlerMetaStatistics[]
    const starpowerMeta = await $axios.$get('/api/meta/starpower') as StarpowerMetaStatistics[]
    const gadgetMeta = await $axios.$get('/api/meta/gadget') as GadgetMetaStatistics[]
    const modeMeta = await $axios.$get('/api/meta/mode') as ModeMetaMap
    const mapMeta = await $axios.$get('/api/meta/map') as MapMetaMap
    const brawlerData = await $axios.$get(`${process.env.mediaUrl}/brawlers/${brawlerId}/info`).catch(() => null) as BrawlerData|null
    const brawlerStats = await $axios.$get('/api/brawler/' + brawlerId).catch(() => null) as BrawlerStatisticsRows|null
    return {
      brawlerId,
      brawlerName: capitalizeWords(brawlerId.replace(/_/g, ' ')), // TODO this does not restore '.' (Mr. P)
      activeEvents,
      brawlerMeta,
      starpowerMeta,
      gadgetMeta,
      modeMeta,
      mapMeta,
      brawlerStats,
      brawlerData,
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
