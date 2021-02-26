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
import { Config, State } from '~/lib/cube'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    state: {
      type: Object as PropType<State>,
      required: true
    },
    config: {
      type: Object as PropType<Config>,
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
  watch: {
    config: '$fetch',
    state: '$fetch',
  },
  fetchOnServer: false, // FIXME causes v-table render error :(
  fetchDelay: 0,
  async fetch() {
    this.loading = true

    if (!(this.state.cubeId in this.config)) {
      console.error('Invalid cubeId ' + this.state.cubeId)
      return
    }

    const cube = this.config[this.state.cubeId]
    const sort = cube.measurements
      .find(m => this.state.sortId == m.id)
    if (sort == undefined) {
      throw new Error('Invalid sort id ' + this.state.sortId)
    }
    const dimensions = this.state.dimensionsIds
      .map(id => cube.dimensions.find(d => id == d.id)!)
      .filter(d => d != undefined)
    const measurements = this.state.measurementsIds
      .map(id => cube.measurements.find(m => id == m.id)!)
      .filter(m => m != undefined)

    const query = this.$clicker.constructQuery(dimensions, measurements, this.config[this.state.cubeId].slices, {
      ...cube.defaultSliceValues,
      ...this.state.slices,
    }, cube.metaColumns)
    const rawData = await this.$clicker.query('meta.' + this.state.cubeId, this.state.cubeId,
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

    if (this.state.comparing) {
      const query = this.$clicker.constructQuery(dimensions, measurements, this.config[this.state.cubeId].slices, {
        ...cube.defaultSliceValues,
        ...this.state.comparingSlices,
      }, cube.metaColumns)
      const comparingRawData = await this.$clicker.query('meta.' + this.state.cubeId, this.state.cubeId,
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
