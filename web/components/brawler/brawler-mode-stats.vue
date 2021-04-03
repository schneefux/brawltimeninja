<template>
  <event-card
    :mode="mode"
    :loading="$fetchState.pending"
    size="w-80"
  >
    <div
      slot="content"
      class="flex justify-center"
    >
      <div class="flex items-end bg-gray-800 rounded">
        <media-img
          :path="`/brawlers/${brawlerId}/avatar`"
          size="128"
          clazz="w-16 mr-2"
        ></media-img>
        <kv-table
          v-if="modeTable.length > 0"
          :data="modeTable"
          class="w-48 px-3 py-2"
        ></kv-table>
        <div
          v-else
          class="w-48 flex"
          style="height: 112px;"
        >
          <p class="m-auto">{{ $t('state.no-data') }}</p>
        </div>
      </div>
    </div>

    <b-button
      slot="actions"
      :to="localePath(`/tier-list/mode/${camelToKebab(mode)}`)"
      primary
      prefetch
      sm
    >
      {{ $t('action.open') }}
    </b-button>
  </event-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { commonMeasurements } from '~/lib/cube';
import { camelToKebab, MetaGridEntry } from '@/lib/util';

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
      modeData: undefined as undefined|MetaGridEntry,
      modeTotals: undefined as undefined|MetaGridEntry,
      mapData: [] as MetaGridEntry[],
      mapTotals: [] as MetaGridEntry[],
    }
  },
  watch: {
    brawlerId: '$fetch',
    brawlerName: '$fetch',
    mode: '$fetch',
  },
  fetchDelay: 0,
  fetchOnServer: false,
  async fetch() {
    // TODO use brawler ID

    const modeData = await this.$cube.query({
      cubeId: 'map',
      slices: {
        brawler: [this.brawlerName.toUpperCase()],
        mode: [this.mode],
      },
      measurementsIds: ['winRate', 'useRate', 'picks'],
      dimensionsIds: [],
      sortId: 'picks',
      comparing: false,
      comparingSlices: {},
    })

    const modeTotals = await this.$cube.query({
      cubeId: 'map',
      slices: {
        mode: [this.mode],
      },
      measurementsIds: ['useRate'],
      dimensionsIds: [],
      sortId: 'picks',
      comparing: false,
      comparingSlices: {},
    })

    const mapData = await this.$cube.query({
      cubeId: 'map',
      slices: {
        brawler: [this.brawlerName.toUpperCase()],
        mode: [this.mode],
      },
      measurementsIds: ['winRate', 'useRate'],
      dimensionsIds: ['map'],
      sortId: 'picks',
      comparing: false,
      comparingSlices: {},
    })

    const mapTotals = await this.$cube.query({
      cubeId: 'map',
      slices: {
        mode: [this.mode],
      },
      measurementsIds: ['winRate', 'useRate'],
      dimensionsIds: ['map'],
      sortId: 'picks',
      comparing: false,
      comparingSlices: {},
    })

    if (modeData.data.length > 0) {
      this.modeData = modeData.data[0]
    }
    if (modeTotals.data.length > 0) {
      this.modeTotals = modeTotals.data[0]
    }
    this.mapData = mapData.data
    this.mapTotals = mapTotals.data
  },
  computed: {
    aboveAverageMaps(): number {
      const compareMaps = (m: MetaGridEntry, t: MetaGridEntry|undefined) => t == undefined ? false : (m.measurementsRaw.winRate as number) * (m.measurementsRaw.useRate as number) > (t.measurementsRaw.winRate as number) * (t.measurementsRaw.useRate as number) / this.totalBrawlers
      const findTotal = (m: MetaGridEntry) => this.mapTotals.find(m2 => m2.dimensionsRaw.map.map == m.dimensionsRaw.map.map)
      return this.mapData.filter(m => compareMaps(m, findTotal(m))).length
    },
    camelToKebab() {
      return camelToKebab
    },
    modeTable(): string[][] {
      if (this.modeData == undefined || this.modeTotals == undefined) {
        return []
      }
      return [
        [ commonMeasurements.picks.name, this.$clicker.format(commonMeasurements.picks, this.modeData.measurementsRaw.picks) ],
        [ commonMeasurements.useRate.name, this.$clicker.format(commonMeasurements.useRate, (this.modeData.measurementsRaw.useRate as number) / (this.modeTotals.measurementsRaw.useRate as number)) ],
        [ commonMeasurements.winRate.name, this.$clicker.format(commonMeasurements.winRate, this.modeData.measurementsRaw.winRate as number) ],
        [ 'Viable Maps', this.aboveAverageMaps + '/' + this.mapData.length ],
      ]
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers as number,
    })
  },
})
</script>
