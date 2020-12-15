<template>
  <div class="flex flex-wrap justify-center">
    <meta-slicers
      :value="slices"
      :measurement="measurement"
      :measurements="measurements"
      :cube="cube"
      :loading="loading"
      class="w-full sticky z-10 top-12 lg:top-0!"
      @input="s => $emit('slices', s)"
      @measurement="m => setMeasurement(m)"
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
import { formatSI, MetaGridEntry } from '~/lib/util'

export default Vue.extend({
  props: {
    slices: {
      type: Object as PropType<Record<string, string[]>>,
      required: true
    },
    entries: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true
    },
    measurements: {
      type: Array as PropType<string[]>,
      required: false
    },
    defaultMeasurement: {
      type: String,
      default: 'winRateAdj'
    },
    description: {
      type: String
    },
    loading: {
      type: Boolean
    },
    sample: {
      type: Number,
      required: true
    },
    sampleMin: {
      type: Number
    },
    timestamp: {
      type: String,
      required: true
    },
    cube: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      views: {
        tierlist: 'Tier List',
        legacy: 'Details',
      },
      view: 'tierlist',
      measurement: this.defaultMeasurement,
      updateCallback: undefined as (()=>void)|undefined,
    }
  },
  watch: {
    entries() {
      // delay component rerendering until data has been refreshed
      if (this.updateCallback != undefined) {
        this.updateCallback()
        this.updateCallback = undefined
      }
    },
  },
  methods: {
    setView(v: string) {
      if (v == 'legacy') {
        this.updateCallback = () => this.view = v
        this.$emit('measurements', this.measurements)
      } else {
        // refresh in background
        this.view = v
        this.$emit('measurements', [this.measurement])
      }
    },
    setMeasurement(m: string) {
      if (this.view == 'legacy') {
        // refresh in background
        this.measurement = m
        this.$emit('measurements', this.measurements)
      } else {
        this.updateCallback = () => this.measurement = m
        this.$emit('measurements', [m])
      }
    },
    downloadCsv() {
      this.$gtag.event('click', {
        'event_category': this.cube + '_meta',
        'event_label': 'download_csv',
      })

      this.updateCallback = () => {
        const csv = 'title,brawler,sampleSize,' + this.measurements.join(',') + '\n'
          + this.entries.map(entry => entry.title + ',' + entry.brawler + ',' + entry.sampleSize + ',' + this.measurements.map(stat => entry.stats[stat]).join(',')).join('\n')
        const downloader = document.createElement('a')
        downloader.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
        downloader.target = '_blank'
        downloader.download = 'export.csv'
        downloader.click()
      }
      this.$emit('measurements', this.measurements)
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
