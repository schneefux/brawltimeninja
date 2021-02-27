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
    ignoreMeta: {
      type: Boolean
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
    // sort-id may either refer to a measurement or a dimension
    const sortMeasurement = cube.measurements
      .find(m => this.state.sortId == m.id)
    const sortDimension = cube.dimensions
      .find(d => this.state.sortId == d.id)
    const sortColumn = sortMeasurement?.column || sortDimension?.column
    if (sortColumn == undefined) {
      throw new Error('Invalid sort id ' + this.state.sortId)
    }
    const dimensions = this.state.dimensionsIds
      .map(id => {
        const dimension = cube.dimensions.find(d => id == d.id)
        if (dimension == undefined) throw new Error('Invalid dimension id ' + id)
        return dimension
      })
    const measurements = this.state.measurementsIds
      .map(id => {
        const measurement = cube.measurements.find(d => id == d.id)
        if (measurement == undefined) throw new Error('Invalid measurements id ' + id)
        return measurement
      })

    const query = this.$clicker.constructQuery(dimensions, measurements, this.config[this.state.cubeId].slices, {
      ...cube.defaultSliceValues,
      ...this.state.slices,
    }, this.ignoreMeta ? [] : cube.metaColumns)
    const rawData = await this.$clicker.query('meta.' + this.state.cubeId, this.state.cubeId,
      query.dimensions,
      query.measurements,
      query.slices, {
        ...(sortColumn != undefined ? {
          sort: { [sortColumn]: 'desc' },
        } : {}),
        cache: 60*30,
        limit: this.limit,
      })

    let data = this.$clicker.mapToMetaGridEntry(dimensions, measurements, rawData.data, rawData.totals, this.ignoreMeta ? [] : cube.metaColumns)

    if (this.state.comparing) {
      const query = this.$clicker.constructQuery(dimensions, measurements, this.config[this.state.cubeId].slices, {
        ...cube.defaultSliceValues,
        ...this.state.comparingSlices,
      }, this.ignoreMeta ? [] : cube.metaColumns)
      const comparingRawData = await this.$clicker.query('meta.' + this.state.cubeId, this.state.cubeId,
        query.dimensions,
        query.measurements,
        query.slices, {
          ...(sortColumn != undefined ? {
            sort: { [sortColumn]: 'desc' },
          } : {}),
          cache: 60*30,
          limit: this.limit,
        })

      const comparingData = this.$clicker.mapToMetaGridEntry(dimensions, measurements, comparingRawData.data, comparingRawData.totals, this.ignoreMeta ? [] : cube.metaColumns)

      // in case the comparison is 1:m (comparing across hierarchy levels), make visualisations iterate over the m
      let [left, right] = (data.length > comparingData.length) ? [comparingData, data] : [data, comparingData]

      if (sortMeasurement != undefined) {
        data = this.$clicker.compareEntries(left, right, 'diff')
          .sort((e1, e2) => sortMeasurement.sign * (e1.measurementsRaw[sortMeasurement.id] - e2.measurementsRaw[sortMeasurement.id]))
      }
      if (sortDimension != undefined) {
        data = this.$clicker.compareEntries(left, right, 'diff')
          .sort((e1, e2) => (e1.dimensions[sortDimension.id].localeCompare(e2.dimensions[sortDimension.id])))
      }
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
