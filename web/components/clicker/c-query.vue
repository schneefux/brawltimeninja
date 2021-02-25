<template>
  <div class="contents">
    <slot
      v-if="result != undefined"
      :state="state"
      :comparing="state.comparing"
      :loading="loading"
      :data="result.data"
      :dimensions="result.dimensions"
      :measurements="result.measurements"
      v-bind="$attrs"
    ></slot>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Config, SliceValue, State } from '~/lib/cube'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    config: {
      type: Object as PropType<Config>,
      required: true
    },
    cubeId: {
      type: String,
      required: true
    },
    dimensionsIds: {
      type: Array as PropType<string[]>,
      required: true
    },
    measurementsIds: {
      type: Array as PropType<string[]>,
      required: true
    },
    slicesValues: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
    comparingSlicesValues: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
    comparing: {
      type: Boolean,
      default: false
    },
    sortId: {
      type: String,
      required: true
    },
    limit: {
      type: Number
    },
  },
  data() {
    return {
      loading: false,
      result: undefined as any,
    }
  },
  computed: {
    state(): State {
      return {
        cubeId: this.cubeId,
        slices: this.slicesValues,
        comparingSlices: this.comparingSlicesValues,
        dimensionsIds: this.dimensionsIds,
        measurementsIds: this.measurementsIds,
        comparing: this.comparing,
      }
    },
  },
  watch: {
    config: '$fetch',
    cubeId: '$fetch',
    dimensionsIds: '$fetch',
    measurementsIds: '$fetch',
    slicesValues: '$fetch',
    comparingSlicesValues: '$fetch',
    sortId: '$fetch',
  },
  fetchOnServer: false, // FIXME causes v-table render error :(
  fetchDelay: 0,
  async fetch() {
    this.loading = true

    if (!(this.cubeId in this.config)) {
      console.error('Invalid cubeId ' + this.cubeId)
      return
    }

    const cube = this.config[this.cubeId]
    const sort = cube.measurements
      .find(m => this.sortId == m.id)
    if (sort == undefined) {
      throw new Error('Invalid sort id ' + this.sortId)
    }
    const dimensions = this.dimensionsIds
      .map(id => cube.dimensions.find(d => id == d.id)!)
      .filter(d => d != undefined)
    const measurements = this.measurementsIds
      .map(id => cube.measurements.find(m => id == m.id)!)
      .filter(m => m != undefined)

    const query = this.$clicker.constructQuery(dimensions, measurements, this.config[this.cubeId].slices, {
      ...cube.defaultSliceValues,
      ...this.slicesValues,
    }, cube.metaColumns)
    const rawData = await this.$clicker.query('meta.' + this.cubeId, this.cubeId,
      query.dimensions,
      query.measurements,
      query.slices, {
        ...(sort != undefined ? {
          sort: { [sort.column]: 'desc' },
        } : {}),
        cache: 60*30,
        limit: this.limit,
      })

    let data = this.$clicker.mapToMetaGridEntry(dimensions, measurements, rawData.data, rawData.totals, cube.metaColumns)

    if (this.comparing) {
      const query = this.$clicker.constructQuery(dimensions, measurements, this.config[this.cubeId].slices, {
        ...cube.defaultSliceValues,
        ...this.comparingSlicesValues,
      }, cube.metaColumns)
      const comparingRawData = await this.$clicker.query('meta.' + this.cubeId, this.cubeId,
        query.dimensions,
        query.measurements,
        query.slices, {
          ...(sort != undefined ? {
            sort: { [sort.column]: 'desc' },
          } : {}),
          cache: 60*30,
          limit: this.limit,
        })

      const comparingData = this.$clicker.mapToMetaGridEntry(dimensions, measurements, comparingRawData.data, comparingRawData.totals, cube.metaColumns)

      // in case the comparison is 1:m (comparing across hierarchy levels), make visualisations iterate over the m
      let [left, right] = (data.length > comparingData.length) ? [comparingData, data] : [data, comparingData]

      data = this.$clicker.compareEntries(left, right, 'diff')
        .sort((e1, e2) => sort.sign * (e1.measurementsRaw[sort.id] - e2.measurementsRaw[sort.id]))
    }

    this.result = {
      data,
      dimensions,
      measurements,
    }
    this.loading = false
  },
})
</script>
