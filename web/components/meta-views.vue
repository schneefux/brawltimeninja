<template>
  <div>
    <div class="section mt-4 card px-3 py-2 card--dark">
      <div class="w-full flex">
        <div class="w-14 flex-shrink-0 mt-1">
          <span>Layout</span>
        </div>
        <div class="flex flex-wrap">
          <button
            v-for="(name, key) in views"
            :key="key"
            :class="{
              'button--selected': view == key,
            }"
            class="button mr-1"
            @click="setView(key)"
          >
            {{ name }}
          </button>
        </div>
      </div>

      <div
        v-if="showMetricSelector"
        class="w-full mt-3 flex"
      >
        <div class="w-14 flex-shrink-0 mt-1">
          <span>Metric</span>
        </div>
        <div class="flex flex-wrap">
          <button
            v-for="m in measurements"
            :key="m"
            class="mr-2 mb-1 button button--sm"
            :class="{ 'button--selected': measurement == m }"
            @click="setMeasurement(m)"
          >
            {{ metaStatMaps.labels[m] }}
          </button>
        </div>
      </div>

      <p
        v-if="showMetricSelector"
        class="w-full mt-2"
      >
        {{ metaStatMaps.descriptions[measurement] }}
      </p>
    </div>

    <meta-tier-list
      v-if="view == 'tierlist'"
      :entries="entries"
      :description="description"
    ></meta-tier-list>
    <meta-table
      v-if="view == 'table'"
      :entries="entries"
      :stat="measurement"
    ></meta-table>
    <meta-grid
      v-if="view == 'legacy'"
      :entries="entries"
      :key="measurement"
      :default-stat="measurement"
      :ga-category="gaCategory"
    ></meta-grid>
    <meta-graph
      v-if="view == 'graph'"
      :entries="entries"
      :stat="measurement"
    ></meta-graph>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { measurementMap, MetaGridEntry, metaStatMaps } from '../lib/util'

export default Vue.extend({
  props: {
    entries: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true
    },
    measurements: {
      type: Array as PropType<string[]>,
      required: false
    },
    gaCategory: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false
    },
  },
  data() {
    return {
      views: {
        tierlist: 'Tier List',
        table: 'Table',
        legacy: 'Details',
        graph: 'Graph',
      },
      view: 'tierlist',
      nextView: undefined as string|undefined,
      measurement: 'winRate',
      nextMeasurement: undefined as string|undefined,
    }
  },
  watch: {
    entries() {
      // delay component rerendering until data has been refreshed
      if (this.nextView != undefined) {
        this.view = this.nextView
        this.nextView = undefined
      }
      if (this.nextMeasurement != undefined) {
        this.measurement = this.nextMeasurement
        this.nextMeasurement = undefined
      }
    },
  },
  methods: {
    setView(v: string, old: string) {
      if (v == 'legacy') {
        this.$emit('measurements', this.measurements)
      }
      if (v == 'tierlist') {
        this.$emit('measurements', ['winsZScore'])
      }
      if (['table', 'graph'].includes(v) && !['table', 'graph'].includes(old)) {
        this.setMeasurement(this.measurements[0])
      }
      this.nextView = v
      this.$ga.event(this.gaCategory, 'click', 'show_' + v)
    },
    setMeasurement(m: string) {
      if (this.view == 'legacy') {
        // do not refetch, just update the sort
        this.measurement = m
      } else {
        this.$emit('measurements', [m])
        this.nextMeasurement = m
      }
    }
  },
  computed: {
    metaStatMaps() {
      return metaStatMaps
    },
    showMetricSelector(): boolean {
      return ['table', 'graph', 'legacy'].includes(this.view) && this.measurements != undefined
    },
  },
})
</script>
