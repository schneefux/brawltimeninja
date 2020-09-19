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
        data-full-width-responsive
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
      ></meta-slicers>
      <meta-grid
        :entries="brawlers"
        default-stat="winRate"
        ga-category="map_meta"
      />
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="3536131238"
        data-ad-format="auto"
        data-full-width-responsive
      />
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { formatMode, MetaGridEntry, MetaGridEntrySorted, getBest, brawlerId } from '../../../lib/util'
import { MapMetaMap, MapMap, Map } from '../../../model/MetaEntry'

interface MapWithId extends Map {
  id: string
  modeName: string
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
      best: [] as MetaGridEntrySorted[],
      trophyRange: [0, 10],
      slices: {
        brawler_trophyrange: [0, 10],
        trophy_season_end: ['balance'],
      },
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
  computed: {
    totalSampleSize(): number {
      return this.totals.picks
    },
    brawlers(): MetaGridEntry[] {
      return this.data.map(row => ({
        id: row.brawler_name,
        brawler: row.brawler_name,
        title: row.brawler_name,
        stats: {
          winRate: row.battle_victory,
          useRate: row.picks_weighted / this.totals.picks_weighted,
          pickRate: row.picks / this.totals.picks,
          starRate: row.battle_starplayer,
          rank1Rate: row.battle_rank1 / this.totals.battle_rank1,
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
  async asyncData({ store, params, error, $clicker }) {
    const events = await $clicker.query('map',
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
        brawler_trophyrange: [0, 10],
        trophy_season_end: ['balance'],
        battle_event_id: [params.event],
      },
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
