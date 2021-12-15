<template>
  <b-card v-bind="$attrs">
    <div
      slot="content"
      class="flex flex-wrap items-center"
    >
      <div class="grid grid-cols-20-1fr gap-y-3 my-3 items-center">
        <h1 class="inline font-semibold mr-4">
          Source
        </h1>

        <div>
          <b-select
            :value="value.cubeId"
            dark
            sm
            @input="v => onInputCubeId(v)"
          >
            <option
              v-for="c in cubes"
              :key="c.id"
              :value="c.id"
            >
              {{ c.name }}
            </option>
          </b-select>
        </div>

        <c-metric
          :value="value"
          :multiple="!compareMode && advancedMode"
          class="col-span-2"
          @input="s => $emit('input', s)"
        ></c-metric>

        <c-dimension
          :value="value"
          class="col-span-2"
          @input="s => $emit('input', s)"
        ></c-dimension>

        <c-dimension
          v-if="compareMode"
          :value="value"
          class="col-span-2"
          @input="s => $emit('input', s)"
          comparing
        ></c-dimension>

        <label
          v-if="canCompare"
          class="col-span-2 flex items-center"
        >
          <b-checkbox v-model="compareMode"></b-checkbox>
          <span class="ml-2">Comparison Mode</span>
        </label>

        <label class="col-span-2 flex items-center">
          <b-checkbox v-model="advancedMode"></b-checkbox>
          <span class="ml-2">Expert Options</span>
        </label>
      </div>
    </div>
  </b-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { CubeQuery, Cube, CubeComparingQuery } from '~/klicker'
import CMetric from '~/klicker/components/c-metric.vue'
import CDimension from '~/klicker/components/c-dimension.vue'
import BSelect from '~/klicker/components/ui/b-select.vue'
import BCheckbox from '~/klicker/components/ui/b-checkbox.vue'
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'

export default Vue.extend({
  components: {
    CMetric,
    CDimension,
    BSelect,
    BCheckbox,
  },
  inheritAttrs: false,
  props: {
    value: {
      type: Object as PropType<CubeQuery|CubeComparingQuery>,
      required: true
    },
  },
  data() {
    const queryIsDefault = !this.value.comparing && !this.$klicker.config[this.value.cubeId].hidden
      && this.value.measurementsIds.length == this.$klicker.config[this.value.cubeId].defaultMeasurementIds.length
      && JSON.stringify(this.value.dimensionsIds) == JSON.stringify(this.$klicker.config[this.value.cubeId].defaultDimensionsIds)

    return {
      advancedMode: !queryIsDefault,
    }
  },
  methods: {
    onInputCubeId(c: string) {
      // filter & keep old slice values that exist in the new cube too
      const slicesDefaults = Object.assign({},
        this.$klicker.config[c].defaultSliceValues,
        Object.fromEntries(
          Object.entries(this.value.slices)
            .filter(([key, value]) => this.$klicker.config[c].slices.some(s => s.id == key))
        ))

      // keep old measurements if they all exist in the new cube
      const measurementsIdsDefaults = !this.value.comparing && this.value.measurementsIds
        .every(m => this.$klicker.config[c].measurements.some(mm => mm.id == m))
        ? this.value.measurementsIds
        : this.$klicker.config[c].defaultMeasurementIds

      this.$emit('input', <CubeQuery>{
        cubeId: c,
        slices: slicesDefaults,
        dimensionsIds: this.$klicker.config[c].defaultDimensionsIds,
        measurementsIds: measurementsIdsDefaults,
      })
    },
  },
  computed: {
    compareMode: {
      get(): boolean {
        return this.value.comparing ? true : false
      },
      set(wantComparing: boolean) {
        const isComparing = this.value.comparing ? true : false

        if (!isComparing && wantComparing) {
          const current = this.value as CubeQuery
          const newQuery: CubeQuery = {
            cubeId: current.cubeId,
            slices: current.slices,
            dimensionsIds: current.dimensionsIds,
            measurementsIds: [current.measurementsIds[0]],
            sortId: current.measurementsIds[0],
          }
          this.$emit('input', <CubeComparingQuery>{
            ...newQuery,
            reference: newQuery,
            comparing: true,
          })
        }
        if (isComparing && !wantComparing) {
          const current = this.value as CubeComparingQuery
          const newQuery: CubeQuery = {
            ...current,
            sortId: current.measurementsIds[0],
          }
          delete (<any>newQuery).reference
          delete (<any>newQuery).comparing
          this.$emit('input', newQuery)
        }
      }
    },
    cubes(): Cube[] {
      return Object.values(this.$klicker.config)
        .filter((cube) => this.advancedMode || !cube.hidden)
    },
    canCompare(): boolean {
      if (this.value.comparing) {
        return true
      }

      const measurements = this.$klicker.config[this.value.cubeId].measurements
      const query = this.value as CubeQuery
      const selectedMeasurements = measurements.filter(m => query.measurementsIds.includes(m.id))
      return selectedMeasurements.length == 1 && selectedMeasurements[0].type == 'quantitative'
    },
    faPlus() {
      return faPlus
    },
    faMinus() {
      return faMinus
    },
  }
})
</script>

<style lang="postcss" scoped>
.grid-cols-20-1fr {
  grid-template-columns: 10rem 1fr;
}
</style>
