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
        :measurements="measurements"
        :measurement="measurement"
        :loading="$fetchState.pending"
        cube="map"
        @select="(m) => measurement = m"
      ></meta-slicers>
      <meta-views
        v-if="totalSampleSize > 0"
        :entries="entries"
        :measurement="measurement"
        @view="v => loadAll = (v == 'legacy')"
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
      measurement: 'wins',
      totalSampleSize: 0,
      loadAll: false,
    }
  },
  watch: {
    slices: '$fetch',
    measurement: '$fetch',
    loadAll: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const measurements = !this.loadAll ? [measurementMap[this.measurement], 'picks'] : [...this.measurements.map(m => measurementMap[m]), 'picks']
    const data = await this.$clicker.query('meta.mode', 'map',
      ['brawler_name'],
      measurements,
      this.slices,
      { sort: { picks: 'desc' }, cache: 60*60 })

    this.entries = data.data.map(row => ({
      id: row.brawler_name,
      brawler: row.brawler_name,
      title: capitalizeWords(row.brawler_name.toLowerCase()),
      stats: !this.loadAll ? {
        [this.measurement]: row[measurementMap[this.measurement]]
          / (measurementOfTotal[this.measurement] ? data.totals[measurementMap[this.measurement]] : 1),
      } : {
        wins: row.wins,
        winRate: row.battle_victory,
        useRate: row.picks_weighted / data.totals.picks_weighted,
        pickRate: row.picks / data.totals.picks,
        starRate: row.battle_starplayer,
        rank1Rate: row.battle_rank1,
        duration: row.battle_duration,
      },
      sampleSize: row.picks,
      link: `/tier-list/brawler/${brawlerId({ name: row.brawler_name })}`,
    }) as MetaGridEntry)
    this.totalSampleSize = data.totals.picks
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
        cache: 60*60*24,
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
      if (this.mode == 'heist' || this.mode == 'bounty') {
        measurements = [...measurements, 'starRate']
      }
      if (this.mode == 'gemGrab') {
        measurements = [...measurements, 'starRate', 'duration']
      }
      if (this.mode.endsWith('howdown')) {
        measurements = [...measurements, 'rank1Rate']
      }
      return measurements
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
