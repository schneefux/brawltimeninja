<template>
  <event-card :mode="mode">
    <div slot="actions" class="flex justify-end">
      <nuxt-link
        :to="`/tier-list/mode/${camelToKebab(mode)}`"
        class="card__action"
      >
        Open
      </nuxt-link>
    </div>

    <div slot="content" class="my-2 flex">
      <div class="flex justify-center bg-gray-800 rounded mx-auto">
        <div class="flex flex-col justify-end mr-2">
          <media-img
            :path="`/brawlers/${brawlerId}/avatar`"
            size="128"
            clazz="w-16"
          ></media-img>
        </div>
        <dl
          v-if="!$fetchState.pending && modeData.picks > 500"
          class="w-48 px-3 py-2"
        >
          <div class="flex justify-between">
            <dt>Use Rate</dt>
            <dd>{{ metaStatMaps.formatters.useRate(modeData.picks_weighted / modeTotals.picks_weighted) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>Win Rate</dt>
            <dd>{{ metaStatMaps.formatters.winRate(modeData.battle_victory) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>Viable Maps</dt>
            <dd>{{ aboveAverageMaps }}/{{ mapData.length }}</dd>
          </div>
        </dl>
        <div
          v-else
          class="w-48 flex"
          style="height: 76px;"
        >
          <p class="m-auto">Not enough data yet.</p>
        </div>
      </div>
    </div>,
  </event-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import { metaStatMaps, camelToKebab } from '../lib/util';
import { ModeMetaMap, MapMetaMap, MapMeta, ModeMeta } from '../model/MetaEntry';

interface ModeRow {
  battle_victory: number
  picks: number
  picks_weighted: number
}

interface ModeTotal {
  picks_weighted: number
}

interface MapRow {
  battle_event_map: string
  battle_victory: number
  picks_weighted: number
}

export default Vue.extend({
  props: {
    brawlerId: {
      type: String,
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
    mode: {
      // camel case
      type: String,
      required: true
    },
  },
  data() {
    return {
      modeData: {} as ModeRow,
      modeTotals: {} as ModeTotal,
      mapData: [] as MapRow[],
      mapTotals: [] as MapRow[],
    }
  },
  fetchDelay: 0,
  fetchOnServer: false,
  async fetch() {
    // TODO use brawler ID

    // TODO support group by none in clicker (single value)
    const modeData = await this.$clicker.query<ModeRow>('meta.mode.brawler-mode-stats-widget', 'map',
      ['battle_event_mode'],
      ['battle_victory', 'picks_weighted', 'picks'],
      {
        ...this.$clicker.defaultSlices('map'),
        brawler_name: [this.brawlerName.toUpperCase()],
        battle_event_mode: [this.mode],
      },
      { cache: 60*60 })
    if (modeData.data.length > 0) {
      this.modeData = modeData.data[0]
    }

    const modeTotals = await this.$clicker.query<ModeRow>('meta.mode.brawler-mode-stats-widget', 'map',
      ['battle_event_mode'],
      ['picks_weighted'],
      {
        ...this.$clicker.defaultSlices('map'),
        battle_event_mode: [this.mode],
      },
      { cache: 60*60 })
    if (modeTotals.data.length > 0) {
      this.modeTotals = modeTotals.data[0]
    }

    const mapData = await this.$clicker.query<MapRow>('meta.map.brawler-mode-stats-widget', 'map',
      ['battle_event_map'],
      ['battle_victory', 'picks_weighted'],
      {
        ...this.$clicker.defaultSlices('map'),
        brawler_name: [this.brawlerName.toUpperCase()],
        battle_event_mode: [this.mode],
      },
      { cache: 60*60 })
    this.mapData = mapData.data

    const mapTotals = await this.$clicker.query<MapRow>('meta.map.brawler-mode-stats-widget', 'map',
      ['battle_event_map'],
      ['battle_victory', 'picks_weighted'],
      {
        ...this.$clicker.defaultSlices('map'),
        battle_event_mode: [this.mode],
      },
      { cache: 60*60 })
    this.mapTotals = mapTotals.data
  },
  computed: {
    aboveAverageMaps(): number {
      const compareMaps = (m: MapRow, t: MapRow|undefined) => t == undefined ? false : m.battle_victory * m.picks_weighted > t.battle_victory * t.picks_weighted / this.totalBrawlers
      const findTotal = (m: MapRow) => this.mapTotals.find(m2 => m2.battle_event_map == m.battle_event_map)
      return this.mapData.filter(m => compareMaps(m, findTotal(m))).length
    },
    camelToKebab() {
      return camelToKebab
    },
    metaStatMaps() {
      return metaStatMaps
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers as number,
    })
  },
});
</script>
