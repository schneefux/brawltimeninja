<template>
  <div class="flex flex-wrap justify-center">
    <meta-slicers
      :value="slices"
      :measurement="measurement"
      :measurements="measurements"
      :cube="cube"
      :cubes="['map', 'starpower', 'gadget', 'synergy']"
      :loading="loading"
      class="w-full sticky z-10 top-12 lg:top-0!"
      @input="s => setSlices(s)"
      @measurement="m => setMeasurement(m)"
      @cube="c => setCube(c)"
    ></meta-slicers>

    <div class="w-full flex flex-wrap">
      <meta-sample-info
        :data="entries"
        :sample="sample"
        :timestamp="timestamp"
        :measurement="measurement"
        class="w-full max-w-lg"
      ></meta-sample-info>

      <meta-graph
        title="Graph View"
        :entries="entries"
        :stat="measurement"
        class="flex-1 h-64 md:h-full"
        full-height
      ></meta-graph>
    </div>

    <div class="w-full flex flex-wrap justify-center">
      <meta-table
        title="Table View"
        :entries="entries"
        :stat="measurement"
        sm
        full-height
      ></meta-table>

      <div class="flex-1 flex flex-col">
        <card class="-mb-3">
          <div
            slot="content"
            class="w-full flex flex-wrap"
          >
            <span class="text-gray-200 mr-3 font-normal self-center">View</span>
            <b-button
              v-for="(name, key) in views"
              :key="key"
              :selected="view == key"
              class="mr-2 mb-1"
              sm
              dark
              @click="setView(key)"
            >
              {{ name }}
            </b-button>
          </div>
        </card>

        <meta-tier-list
          v-if="view == 'tierlist'"
          :entries="entries"
          :stat="measurement"
          :description="description"
          full-height
          class="h-full"
        ></meta-tier-list>

        <meta-grid
          v-if="view == 'legacy'"
          :measurements="measurements"
          :entries="entries"
          :stat="measurement"
          full-height
          class="h-full"
        ></meta-grid>
      </div>

      <div class="w-full flex">
        <b-button
          class="ml-auto"
          sm
          secondary
          @click="downloadCsv()"
        >
          Download Data
        </b-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { formatDistanceToNow, parseISO } from 'date-fns'
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import { calculateDiffs, measurementMap, MetaGridEntry } from '~/lib/util'

function defaultMeasurement(cube: string) {
  if (['map', 'synergy'].includes(cube)) {
    return 'winRateAdj'
  }
  if (['starpower', 'gadget'].includes(cube)) {
    return 'winsZScore'
  }
  return 'winRate'
}

export default Vue.extend({
  props: {
    defaultCube: {
      type: String,
      required: true
    },
    defaultSlices: {
      type: Object as PropType<Record<string, string[]>>,
      default: () => ({})
    },
    defaultMeasurement: {
      type: String
    },
  },
  data() {
    return {
      cube: this.defaultCube,
      slices: {
        ...this.$clicker.defaultSlices(this.defaultCube),
        ...this.defaultSlices,
      },
      measurement: this.defaultMeasurement || defaultMeasurement(this.defaultCube),
      entries: [] as MetaGridEntry[],
      views: {
        tierlist: 'Tier List',
        legacy: 'Details',
      },
      view: 'tierlist',
      sample: 0,
      timestamp: '1970-01-01',
      loading: false,
    }
  },
  fetchDelay: 0,
  async fetch() {
    await this.update({})
  },
  methods: {
    async setSlices(s: Record<string, string[]>) {
      await this.update({ slices: s })
    },
    async setMeasurement(m: string) {
      await this.update({ measurement: m })
    },
    async setCube(c: string) {
      // reset all selectors
      await this.update({
        cube: c,
        slices: this.$clicker.defaultSlices(c),
        measurement: defaultMeasurement(c),
      })
    },
    async setView(v: string) {
      await this.update({ view: v })
    },
    downloadCsv() {
      this.$gtag.event('click', {
        'event_category': this.cube + '_meta',
        'event_label': 'download_csv',
      })

      // TODO fetch first!
      const csv = 'title,brawler,sampleSize,' + this.measurements.join(',') + '\n'
        + this.entries.map(entry => entry.title + ',' + entry.brawler + ',' + entry.sampleSize + ',' + this.measurements.map(stat => entry.stats[stat]).join(',')).join('\n')
      const downloader = document.createElement('a')
      downloader.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
      downloader.target = '_blank'
      downloader.download = 'export.csv'
      downloader.click()
    },
    async update(args: { measurement?: string, view?: string, slices?: Record<string, string[]>, cube?: string }) {
      this.loading = true

      const measurement = args.measurement || this.measurement
      const view = args.view || this.view
      const slices = args.slices || this.slices
      const cube = args.cube || this.cube

      const measurements = (view == 'legacy' ? this.measurements : [measurement])

      if (cube == 'map') {
        const data = await this.$clicker.query('meta.map', 'map',
          ['brawler_name'],
          [...measurements.map(m => measurementMap[m]), 'picks', 'timestamp'],
          slices,
          { sort: { picks: 'desc' }, cache: 60*30 })

        this.entries = this.$clicker.mapToMetaGridEntry(measurements as any, data.data, data.totals)

        this.sample = data.totals.picks
        this.timestamp = data.totals.timestamp
      }

      if (cube == 'starpower') {
        const calculateZScore = measurements.includes('winsZScore')
        const fetchingMeasurements = measurements
          .map(m => m == 'winsZScore' ? 'winRate' : m)
          .map(m => measurementMap[m])

        const data = await this.$clicker.query('meta.starpower', 'starpower',
          ['brawler_id', 'brawler_name', 'brawler_starpower_id', 'brawler_starpower_name'],
          [...fetchingMeasurements, 'picks', 'timestamp'],
          slices,
          { sort: { picks: 'desc' }, cache: 60*60 })
        this.entries = calculateDiffs(data.data, 'starpowers', 'brawler_starpower_name', 'brawler_starpower_id', calculateZScore)

        this.sample = data.totals.picks
        this.timestamp = data.totals.timestamp
      }

      if (cube == 'gadget') {
        const calculateZScore = measurements.includes('winsZScore')
        const fetchingMeasurements = measurements
          .map(m => m == 'winsZScore' ? 'winRate' : m)
          .map(m => measurementMap[m])

        const data = await this.$clicker.query('meta.gadget', 'gadget',
          ['brawler_id', 'brawler_name', 'brawler_gadget_id', 'brawler_gadget_name'],
          [...fetchingMeasurements, 'picks', 'timestamp'],
          slices,
          { sort: { picks: 'desc' }, cache: 60*60 })
        this.entries = calculateDiffs(data.data, 'gadgets', 'brawler_gadget_name', 'brawler_gadget_id', calculateZScore)

        this.sample = data.totals.picks
        this.timestamp = data.totals.timestamp
      }

      if (cube == 'synergy') {
        const data = await this.$clicker.query('meta.synergy', 'synergy',
          ['brawler_name'],
          [...measurements.map(m => measurementMap[m]), 'picks', 'timestamp'],
          slices,
          { sort: { picks: 'desc' }, cache: 60*30 })

        this.entries = this.$clicker.mapToMetaGridEntry(measurements as any, data.data, data.totals)

        this.sample = data.totals.picks
        this.timestamp = data.totals.timestamp
      }

      this.measurement = measurement
      this.view = view
      this.slices = slices
      this.cube = cube

      this.loading = false
    }
  },
  computed: {
    description(): string {
      return this.$clicker.describeSlices(this.slices, this.timestamp)
    },
    measurements(): string[] {
      if (['map', 'synergy'].includes(this.cube)) {
        const mode = (this.slices.battle_event_mode || [])[0]
        if (mode == undefined) {
          return ['winRateAdj', 'winRate', 'wins', 'useRate', 'pickRate', 'starRate', 'rank1Rate', 'duration']
        }

        let measurements = ['winRateAdj', 'winRate', 'wins', 'useRate', 'pickRate']
        // all 3v3: star player
        if (['gemGrab', 'heist', 'bounty', 'hotZone', 'brawlBall', 'siege'].includes(mode)) {
          measurements = [...measurements, 'starRate']
        }
        // all 3v3 except bounty: duration
        if (['gemGrab', 'heist', 'hotZone', 'brawlBall', 'siege'].includes(mode)) {
          measurements = [...measurements, 'duration']
        }
        if (mode.endsWith('howdown')) {
          measurements = [...measurements, 'rank1Rate']
        }
        return measurements
      }
      if (['starpower', 'gadget'].includes(this.cube)) {
        return ['winsZScore', 'winRate', 'starRate', 'rank1Rate']
      }
      return []
    },
  },
})
</script>

<style lang="postcss" scoped>
.top-12 {
  top: 3rem;
}

@responsive {
  .top-0\! {
    @apply top-0 !important;
  }
}
</style>
