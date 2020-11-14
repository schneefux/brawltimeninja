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
        data-full-width-responsive="yes"
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
          :key="map.map"
          :class="{ 'md:hidden': !showAllMaps && index >= 3 }"
          class="px-2"
        >
          <event-card
            :mode="mode"
            :map="map.map"
          >
            <template v-slot:content>
              <div class="flex justify-center bg-gray-800">
                <media-img
                  :path="`/maps/${map.id}`"
                  size="384"
                  clazz="h-48"
                ></media-img>
              </div>
              <div class="absolute bottom-0 right-0 mb-4 mr-2">
                <nuxt-link
                  :to="`/tier-list/mode/${camelToKebab(mode)}/map/${slugify(map.map)}`"
                  class="card__action"
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
          class="button button--md button--secondary"
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
        data-full-width-responsive="yes"
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
        :timestamp="totalTimestamp"
        :loading="$fetchState.pending"
        cube="map"
      ></meta-slicers>

      <meta-views
        v-if="totalSampleSize > 0"
        :entries="entries"
        :measurements="measurements"
        :description="description"
        @measurements="ms => selectedMeasurements = ms"
        ga-category="mode_meta"
      ></meta-views>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="8497550588"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { formatMode, MetaGridEntry, brawlerId, measurementMap, capitalizeWords, measurementOfTotal, kebabToCamel } from '~/lib/util'
import { camelToKebab, slugify } from '../../../../lib/util'

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
      slices: this.$clicker.defaultSlices('map'),
      showAllMaps: false,
      mode: '',
      modeName: '',
      maps: [] as EventIdAndMap[],
      entries: [] as MetaGridEntry[],
      selectedMeasurements: ['winRateAdj'],
      totalSampleSize: 0,
      totalTimestamp: undefined as string|undefined,
    }
  },
  watch: {
    slices: '$fetch',
    selectedMeasurements: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('meta.mode', 'map',
      ['brawler_name'],
      [...this.selectedMeasurements.map(m => measurementMap[m]), 'picks', 'timestamp'],
      this.slices,
      { sort: { picks: 'desc' }, cache: 60*60 })

    this.entries = data.data.map(row => ({
      id: row.brawler_name,
      brawler: row.brawler_name,
      title: capitalizeWords(row.brawler_name.toLowerCase()),
      stats: this.selectedMeasurements.reduce((stats, m) => ({
        ...stats,
        [m]: row[measurementMap[m]] / (measurementOfTotal[m] ? data.totals[measurementMap[m]] : 1),
      }), {} as Record<string, number>),
      sampleSize: row.picks,
      link: `/tier-list/brawler/${brawlerId({ name: row.brawler_name })}`,
    }) as MetaGridEntry)
    this.totalSampleSize = data.totals.picks
    this.totalTimestamp = data.totals.timestamp
  },
  async asyncData({ params, $clicker }) {
    const mode = kebabToCamel(params.mode as string)
    const modeName = formatMode(mode)
    const events = await $clicker.query('all.events', 'map',
      ['battle_event_id', 'battle_event_map'],
      ['battle_event_id', 'battle_event_map'],
      { battle_event_mode: [mode] },
      {
        sort: { timestamp: 'desc' },
        cache: 60*60,
      })

    return {
      mode,
      modeName,
      maps: events.data.map(e => ({
        id: e.battle_event_id,
        map: e.battle_event_map,
      })),
      slices: {
        ...$clicker.defaultSlices('map'),
        battle_event_mode: [mode],
      } as any,
    }
  },
  computed: {
    measurements(): string[] {
      let measurements = ['wins', 'winRate', 'useRate', 'pickRate']
      // all 3v3: star player
      if (['gemGrab', 'heist', 'bounty', 'hotZone', 'brawlBall', 'siege'].includes(this.mode)) {
        measurements = [...measurements, 'starRate']
      }
      // all 3v3 except bounty: duration
      if (['gemGrab', 'heist', 'hotZone', 'brawlBall', 'siege'].includes(this.mode)) {
        measurements = [...measurements, 'duration']
      }
      if (this.mode.endsWith('howdown')) {
        measurements = [...measurements, 'rank1Rate']
      }
      return measurements
    },
    description(): string {
      return this.$clicker.describeSlices(this.slices, this.totalTimestamp)
    },
    camelToKebab() {
      return camelToKebab
    },
    slugify() {
      return slugify
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
