<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">{{ event.modeName }}: {{ event.map }}</h1>
      <p>Use the <span class="text-primary-lighter">{{ event.map }}</span> Tier List to find the best Brawler for this {{ event.modeName }} map in Brawl Stars.</p>
    </div>

    <client-only>
      <adsense
        ins-class="ad-section"
        id="ezoic-pub-ad-placeholder-112"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="1665534416"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>

    <div
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'widget'),
        once: true,
      }"
      class="section flex justify-center"
    >
      <map-best-brawlers-card
        :mode="event.mode"
        :map="event.map"
        :id="event.id"
        large
      ></map-best-brawlers-card>
    </div>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'stats'),
        once: true,
      }"
    >
      <h2 class="page-h2">Tier List for {{ event.modeName }} - {{ event.map }}</h2>
    </div>

    <div class="section">
      <meta-slicers
        v-model="slices"
        :sample="totalSampleSize"
        :sample-min="100000"
        :measurements="measurements"
        :measurement="measurement"
        :loading="$fetchState.pending"
        cube="map"
        @select="m => measurement = m"
      ></meta-slicers>

      <meta-views
        v-if="totalSampleSize > 0"
        :entries="entries"
        :measurement="measurement"
        ga-category="map_meta"
        @view="v => loadAll = (v == 'legacy')"
      ></meta-views>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="3536131238"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { formatMode, MetaGridEntry, getBest, brawlerId, measurementMap, capitalizeWords, measurementOfTotal } from '../../../lib/util'
import { MapMetaMap, MapMap, Map } from '../../../model/MetaEntry'

interface MapWithId extends Map {
  id: string
  modeName: string
}

export default Vue.extend({
  head() {
    const description = `Brawl Stars Tier List for ${(<any>this).event.modeName}: ${(<any>this).event.map}. View the best Brawlers with Win Rates and Rankings.`
    return {
      title: `Tier List for ${(<any>this).event.modeName}: ${(<any>this).event.map}`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      event: {
        id: '',
        mode: '',
        modeName: '',
        map: '',
      } as MapWithId,
      slices: this.$clicker.defaultSlices('map'),
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
    const data = await this.$clicker.query('meta.map', 'map',
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
  computed: {
    measurements(): string[] {
      let measurements = ['wins', 'winRate', 'useRate', 'pickRate']
      if (this.event.mode == 'heist' || this.event.mode == 'bounty') {
        measurements = [...measurements, 'starRate']
      }
      if (this.event.mode == 'gemGrab') {
        measurements = [...measurements, 'starRate', 'duration']
      }
      if (this.event.mode.endsWith('howdown')) {
        measurements = [...measurements, 'rank1Rate']
      }
      return measurements
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  async asyncData({ store, params, error, $clicker }) {
    const events = await $clicker.query('all.events', 'map',
      ['battle_event_id', 'battle_event_mode', 'battle_event_map'],
      ['battle_event_id'],
      { battle_event_id: [params.event] },
      { cache: 60*60*24 })
    if (events.data.length == 0) {
      return error({ statusCode: 404, message: 'Event not found' })
    }
    const event = events.data[0]

    return {
      event: {
        id: params.event,
        map: event.battle_event_map,
        mode: event.battle_event_mode,
        modeName: formatMode(event.battle_event_mode as string),
      } as MapWithId,
      slices: {
        ...$clicker.defaultSlices('map'),
        battle_event_id: [params.event],
      } as any,
    }
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string) {
      if (visible) {
        this.$ga.event('map_meta', 'scroll', section)
      }
    },
  },
})
</script>
