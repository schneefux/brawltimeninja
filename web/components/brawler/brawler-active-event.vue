<template>
  <event-card
    :mode="mode"
    :map="map"
    :id="id"
    :loading="$fetchState.pending"
    size="w-80"
  >
    <p v-if="end != undefined" slot="infobar" class="text-right">
      {{ $t('time.ends-in', { time: timeTillEnd }) }}
    </p>

    <div
      slot="content"
      class="flex justify-center"
    >
      <div class="flex items-end bg-gray-800 rounded">
        <media-img
          :path="`/brawlers/${brawlerId}/avatar`"
          :alt="brawlerName"
          size="128"
          clazz="w-16 mr-2"
        ></media-img>
        <kv-table
          v-if="table.length > 0"
          class="w-48 px-3 py-2"
          :data="table"
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
      :to="localePath(`/tier-list/mode/${camelToKebab(mode)}/map/${slugify(map)}`)"
      primary
      prefetch
      sm
    >
      {{ $t('action.open') }}
    </b-button>
  </event-card>
</template>

<script lang="ts">
import { formatDistanceToNow, parseISO } from 'date-fns'
import Vue from 'vue'
import { mapState } from 'vuex'
import { commonMeasurements } from '~/lib/cube'
import { brawlerId, camelToKebab, MetaGridEntry, slugify } from '@/lib/util'

export default Vue.extend({
  props: {
    mode: {
      // camel case
      type: String,
      required: true
    },
    map: {
      type: String,
      required: true
    },
    id: {
      type: [String, Number],
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
    end: {
      type: String,
    },
  },
  data() {
    return {
      data: undefined as undefined|MetaGridEntry,
      totals: undefined as undefined|MetaGridEntry,
    }
  },
  watch: {
    mode: '$fetch',
    map: '$fetch',
    brawlerName: '$fetch',
  },
  fetchDelay: 0,
  fetchOnServer: false,
  async fetch() {
    const data = await this.$cube.query({
      cubeId: 'map',
      slices: {
        map: [this.map],
        mode: [this.mode],
        brawler: [this.brawlerName.toUpperCase()],
      },
      dimensionsIds: [],
      measurementsIds: ['winRate', 'picks', 'useRate', 'wins'],
      sortId: 'picks',
      comparing: false,
      comparingSlices: {},
    })

    const totals = await this.$cube.query({
      cubeId: 'map',
      slices: {
        map: [this.map],
        mode: [this.mode],
      },
      dimensionsIds: [],
      measurementsIds: ['useRate'],
      sortId: 'picks',
      comparing: false,
      comparingSlices: {},
    })

    this.data = data.data[0]
    this.totals = totals.data[0]
  },
  computed: {
    useRate(): number {
      if (this.data == undefined || this.totals == undefined) {
        return 0
      }
      return (this.data.measurementsRaw.useRate as number) / (this.totals.measurementsRaw.useRate as number)
    },
    timeTillEnd(): string {
      if (this.end == undefined) {
        return ''
      }
      return formatDistanceToNow(parseISO(this.end))
    },
    table(): string[][] {
      if (this.data == undefined) {
        return []
      }
      return [
        [ this.$tc('metric.picks'), this.data.measurements.picks ],
        [ this.$tc('metric.useRate'), this.$clicker.format(commonMeasurements.useRate, this.useRate) ],
        [ this.$tc('metric.winRate'), this.data.measurements.winRate ],
      ]
    },
    brawlerId(): string {
      return brawlerId({ name: this.brawlerName })
    },
    camelToKebab() {
      return camelToKebab
    },
    slugify() {
      return slugify
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers,
    })
  },
})
</script>
