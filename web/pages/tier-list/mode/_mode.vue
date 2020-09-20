<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">{{ modeName }}</h1>
      <p>Use the <span class="text-primary-lighter">{{ modeName }}</span> Tier List to find the best Brawler for all {{ modeName }} maps in Brawl Stars.</p>
    </div>

    <client-only>
      <adsense
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="2291234880"
        data-ad-format="auto"
        data-full-width-responsive
      />
    </client-only>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'maps'),
        once: true,
      }"
    >
      <h2 class="page-h2">Map Tier Lists</h2>
      <p>Open on a Map to view the Tier List for it.</p>
    </div>

    <div class="section">
      <div class="overflow-x-auto scrolling-touch flex md:justify-center md:flex-wrap">
        <div
          v-for="(map, index) in maps"
          :key="map.id"
          :class="{ 'md:hidden': !showAllMaps && index >= 3 }"
          class="px-2"
        >
          <event-card
            :mode="mode"
            :map="map.map"
          >
            <template v-slot:content>
              <div class="flex justify-center bg-black">
                <media-img
                  :path="`/maps/${map.id}`"
                  size="384"
                  clazz="h-48"
                ></media-img>
              </div>
              <div class="absolute bottom-0 right-0 mb-4 mr-2">
                <nuxt-link
                  :to="`/tier-list/map/${map.id}`"
                  class="button button--md"
                >
                  Open
                </nuxt-link>
              </div>
            </template>
          </event-card>
        </div>
      </div>

      <div class="mt-2 w-full text-right hidden md:block">
        <button
          v-show="!showAllMaps"
          class="button button--md"
          @click="showAllMaps = true; $ga.event('meta_mode', 'load_more')"
        >
          Show All {{ modeName }} Maps
        </button>
      </div>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="2263314723"
        data-ad-format="auto"
        data-full-width-responsive
      />
    </client-only>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'stats'),
        once: true,
      }"
    >
      <h2 class="page-h2">Tier List for all {{ modeName }} Maps</h2>
    </div>

    <div class="section">
      <meta-slicers
        v-model="slices"
        :sample="totalSampleSize"
        :sample-min="300000"
        cube="map"
      ></meta-slicers>
      <meta-grid
        :entries="modes"
        default-stat="winRate"
        ga-category="mode_meta"
      />
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="8497550588"
        data-ad-format="auto"
        data-full-width-responsive
      />
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { formatMode, MetaGridEntry, brawlerId } from '../../../lib/util'

const kebabToCamel = (s: string) => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  })
}

interface Row {
  brawler_name: string
  battle_event_mode: number
  picks: number
  picks_weighted: number
  battle_victory: number
  battle_duration: number
  battle_starplayer: number
  battle_rank1: number
}

interface EventIdAndMap {
  id: number
  map: string
}

export default Vue.extend({
  head() {
    const description = `Brawl Stars ${(<any>this).modeName} Tier List. Find the best Brawlers for ${(<any>this).modeName} with Win Rates and Rankings.`
    return {
      title: `${(<any>this).modeName} Tier List`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      slices: {} as any,
      showAllMaps: false,
      mode: '',
      modeName: '',
      maps: [] as EventIdAndMap[],
      data: [] as Row[],
      totals: {} as Row,
    }
  },
  watch: {
    slices: '$fetch',
  },
  async fetch() {
    const data = await this.$clicker.query('map',
      ['brawler_name'],
      ['picks', 'picks_weighted', 'battle_victory', 'battle_duration', 'battle_starplayer', 'battle_rank1'],
      this.slices,
      { sort: { picks: 'desc' }, cache: 60*60 })
    this.data = data.data
    this.totals = data.totals
  },
  async asyncData({ params, $clicker }) {
    const mode = kebabToCamel(params.mode as string)
    const modeName = formatMode(mode)
    const events = await $clicker.query('map',
      ['battle_event_id', 'battle_event_map'],
      ['battle_event_id'],
      { battle_event_mode: [mode] },
      { cache: 60*60*24 })

    return {
      mode,
      modeName,
      maps: events.data.map(e => ({
        id: e.battle_event_id,
        map: e.battle_event_map,
      })),
      slices: {
        battle_event_mode: [mode],
      } as any,
    }
  },
  computed: {
    totalSampleSize(): number {
      return this.totals.picks
    },
    modes(): MetaGridEntry[] {
      return this.data.map(row => ({
        id: row.brawler_name,
        brawler: row.brawler_name,
        title: row.brawler_name,
        stats: {
          winRate: row.battle_victory,
          useRate: row.picks_weighted / this.totals.picks_weighted,
          pickRate: row.picks / this.totals.picks,
          starRate: row.battle_starplayer,
          rank1Rate: row.battle_rank1,
          duration: row.battle_duration,
        },
        sampleSize: row.picks,
        link: `/tier-list/brawler/${brawlerId({ name: row.brawler_name })}`,
      }) as MetaGridEntry)
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string) {
      if (visible) {
        this.$ga.event('mode_meta', 'scroll', section)
      }
    },
  },
})
</script>
