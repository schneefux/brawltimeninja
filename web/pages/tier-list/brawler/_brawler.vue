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

    <div class="section" v-if="brawlerData != null">
      <blockquote class="italic">
        {{ brawlerData.description }}
      </blockquote>

      <dl class="mt-4 max-w-sm bg-gray-800 rounded flex flex-wrap justify-center mx-auto">
        <div class="flex w-full mx-2 my-1">
          <dt class="w-3/4">Health (Level 1)</dt>
          <dd class="w-1/4 text-right">{{ brawlerData.health }}</dd>
        </div>
        <div class="flex w-full mx-2 my-1">
          <dt class="w-3/4">Health (Level 10)</dt>
          <dd class="w-1/4 text-right">{{ Math.round(brawlerData.health * 1.4) }}</dd>
        </div>
        <div class="flex w-full mx-2 my-1">
          <dt class="w-3/4">Speed</dt>
          <dd class="w-1/4 text-right">{{ brawlerData.speed }}</dd>
        </div>
        <div class="flex w-full mx-2 my-1">
          <dt class="w-3/4">Reload Speed</dt>
          <dd class="w-1/4 text-right">{{ brawlerData.main.rechargeTime }}ms</dd>
        </div>
        <div class="flex w-full mx-2 my-1">
          <dt class="w-3/4">Main {{ brawlerData.main.damageLabel }} (Level 10)</dt>
          <dd class="w-1/4 text-right">{{ Math.round(brawlerData.main.damage * 1.4) }}</dd>
        </div>
        <div class="flex w-full mx-2 my-1">
          <dt class="w-3/4">Super {{ brawlerData.super.damageLabel }} (Level 10)</dt>
          <dd class="w-1/4 text-right">{{ Math.round(brawlerData.super.damage * 1.4) }}</dd>
        </div>
      </dl>
    </div>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'starpowers'),
        once: true,
      }"
    >
      <h2 class="page-h2">
        {{ brawlerName }} Star Powers
      </h2>
      <p class="mt-1">
        The statistics are calculated as the difference between a Brawler with one Star Power and a Brawler with zero Star Powers.
      </p>
    </div>

    <media-img
      :path="'/brawlers/' + brawlerId + '/model'"
      clazz="absolute w-1/3 md:w-1/6 mr-2 md:mr-10 right-0 z-0 opacity-25"
    ></media-img>

    <div class="section flex flex-wrap justify-center">
      <brawler-starpower-stats
        :starpower-meta="starpowerMeta"
        :brawler-id="brawlerId"
        :descriptions="(brawlerData||{}).starpowerDescriptions"
      ></brawler-starpower-stats>


      <div class="mt-2 w-full flex justify-end">
        <nuxt-link
          class="button md:button-md"
          to="/tier-list/starpowers"
        >
          Open Star Power Tier List
        </nuxt-link>
      </div>
    </div>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'gadgets'),
        once: true,
      }"
    >
      <h2 class="page-h2">
        Gadget Tier List
      </h2>
      <p class="mt-1">
        The statistics are calculated as the difference between a Brawler with one Gadget and a Brawler with zero Gadgets.
      </p>
    </div>

    <div class="section flex flex-wrap justify-center">
      <brawler-gadget-stats
        :gadget-meta="gadgetMeta"
        :brawler-id="brawlerId"
        :descriptions="(brawlerData||{}).gadgetDescriptions"
      ></brawler-gadget-stats>


      <div class="mt-2 w-full flex justify-end">
        <nuxt-link
          class="button md:button-md"
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
        callback: (v, e) => trackScroll(v, e, 'trophy-graphs'),
        once: true,
      }"
    >
      <h2 class="page-h2">
        {{ brawlerName }} Trophy Graphs
      </h2>
    </div>

    <div class="section flex flex-wrap justify-center">
      <brawler-trophy-graphs
        :brawler-stats="brawlerStats"
        :total-brawlers="totalBrawlers"
      ></brawler-trophy-graphs>

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
        :brawler-id="brawlerId"
      ></brawler-mode-stats>

      <div class="mt-1 w-full flex justify-end">
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
import { capitalize, capitalizeWords } from '../../../lib/util'
import { ModeMetaMap } from '../../../model/MetaEntry'
import { BrawlerStatisticsRows } from '../../../model/Clicker'
import { StarpowerMetaStatistics, GadgetMetaStatistics } from '../../../model/Api'
import { BrawlerData } from '../../../model/Media'

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
      starpowerMeta: [] as StarpowerMetaStatistics[],
      gadgetMeta: [] as GadgetMetaStatistics[],
      modeMeta: {} as ModeMetaMap,
      brawlerStats: {} as BrawlerStatisticsRows,
      brawlerData: null as BrawlerData|null,
      capitalize,
    }
  },
  computed: {
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers as number,
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  async asyncData({ params, $axios }) {
    const brawlerId = params.brawler
    const starpowerMeta = await $axios.$get('/api/meta/starpower') as StarpowerMetaStatistics[]
    const gadgetMeta = await $axios.$get('/api/meta/gadget') as GadgetMetaStatistics[]
    const modeMeta = await $axios.$get('/api/meta/mode') as ModeMetaMap
    const brawlerStats = await $axios.$get('/api/brawler/' + brawlerId) as BrawlerStatisticsRows
    const brawlerData = await $axios.$get(`${process.env.mediaUrl}/brawlers/${brawlerId}/info`).catch(() => null) as BrawlerData|null
    return {
      brawlerId,
      brawlerName: capitalizeWords(brawlerId.replace(/_/g, ' ')), // TODO this does not restore '.' (Mr. P)
      starpowerMeta,
      gadgetMeta,
      modeMeta,
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
