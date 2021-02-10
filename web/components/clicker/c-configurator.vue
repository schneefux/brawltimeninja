<template>
  <card v-bind="$attrs">
    <div
      slot="content"
      class="flex flex-wrap items-center py-1 gap-y-3"
    >
      <div class="mr-6">
        <h1 class="inline md:text-xl font-semibold mr-4">
          Data Source
        </h1>

        <b-select
          :value="value.cubeId"
          dark
          sm
          @input="v => onInputCubeId(v)"
        >
          <option
            v-for="c in config"
            :key="c.id"
            :value="c.id"
          >
            {{ c.name }}
          </option>
        </b-select>
      </div>

      <div class="mr-6">
        <span class="font-semibold mr-4">
          Metric
        </span>

        <b-select
          :value="value.measurementsIds.length == 1 ? value.measurementsIds[0] : ''"
          dark
          sm
          @input="v => onInputMeasurementsIds([v])"
        >
          <option
            v-if="config[value.cubeId].measurements.length > 1"
            value=""
          >All</option>
          <option
            v-for="m in config[value.cubeId].measurements"
            :key="m.id"
            :value="m.id"
          >
            {{ m.name }}
          </option>
        </b-select>
      </div>

      <div class="mr-2">
        <span class="font-semibold mr-4">
          Group By
        </span>

        <b-select
          v-for="group in groups"
          :key="group"
          :value="value.dimensionsIds[group - 1]"
          class="mr-2"
          dark
          sm
          @input="v => onInputDimensionsIds(group - 1, v)"
        >
          <option
            v-for="d in dimensions.filter(d => d.id == value.dimensionsIds[group - 1] || !value.dimensionsIds.includes(d.id))"
            :key="d.id"
            :value="d.id"
          >
            {{ d.name }}
          </option>
        </b-select>

        <b-button
          v-if="groups < dimensions.length"
          class="font-semibold mx-1"
          primary
          sm
          @click="groups++"
        >
          <font-awesome-icon
            :icon="faPlus"
          ></font-awesome-icon>
        </b-button>

        <b-button
          v-if="groups > 0"
          class="font-semibold mx-1"
          primary
          sm
          @click="onGroupRemove()"
        >
          <font-awesome-icon
            :icon="faMinus"
          ></font-awesome-icon>
        </b-button>
      </div>
    </div>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Config, SliceValue } from '~/lib/cube'
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'

export interface Configuration {
  cubeId: string
  slices: SliceValue
  comparingSlices: SliceValue
  dimensionsIds: string[]
  measurementsIds: string[]
}

export default Vue.extend({
  inheritAttrs: false,
  props: {
    value: {
      type: Object as PropType<Configuration>,
      required: true
    },
    config: {
      type: Object as PropType<Config>,
      required: true
    },
  },
  data() {
    return {
      groups: this.config[this.value.cubeId].defaultDimensionsIds.length,
    }
  },
  methods: {
    onInputCubeId(c: string) {
      this.$emit('input', <Configuration>{
        cubeId: c,
        slices: this.config[c].defaultSliceValues,
        comparingSlices: this.config[c].defaultSliceValues,
        dimensionsIds: this.config[c].defaultDimensionsIds,
        measurementsIds: [this.config[c].defaultMeasurementId],
      })
      this.groups = this.config[c].defaultDimensionsIds.length
    },
    onInputDimensionsIds(group: number, d: string) {
      const dimensionsIds = this.value.dimensionsIds.slice()
      dimensionsIds[group] = d
      this.$emit('input', <Configuration>{
        ...this.value,
        dimensionsIds,
      })
    },
    onGroupRemove() {
      this.groups--
      const dimensionsIds = this.value.dimensionsIds.slice()
      dimensionsIds.pop()
      this.$emit('input', <Configuration>{
        ...this.value,
        dimensionsIds,
      })
    },
    onInputMeasurementsIds(m: string[]) {
      if (m[0] == '') {
        m = this.config[this.value.cubeId].measurements.map(m => m.id)
      }
      this.$emit('input', <Configuration>{
        ...this.value,
        measurementsIds: m,
      })
    },
  },
  computed: {
    dimensions() {
      return this.config[this.value.cubeId].dimensions.filter(d => !d.hidden)
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
