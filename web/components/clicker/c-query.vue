<template>
  <div class="contents">
    <slot
      v-if="state != undefined"
      :loading="loading"
      :comparing="comparing"
      :data="state.data"
      :dimensions="state.dimensions"
      :measurements="state.measurements"
      v-bind="$attrs"
    ></slot>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Config, SliceValue } from '~/lib/cube'

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
      state: undefined as any,
    }
  },
  watch: {
    config: '$fetch',
    cubeId: '$fetch',
    dimensionsIds: '$fetch',
    measurementsIds: '$fetch',
    slicesValues: '$fetch',
    comparingSlicesValues: '$fetch',
    sortId: '$fetch',
    comparing: '$fetch',
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
    const dimensions = cube.dimensions
      .filter(d => this.dimensionsIds.includes(d.id))
    const measurements = cube.measurements
      .filter(m => this.measurementsIds.includes(m.id))

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

    this.state = {
      data,
      dimensions,
      measurements,
    }
    this.loading = false
  },
})
</script>
