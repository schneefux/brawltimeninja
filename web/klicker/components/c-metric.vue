<template>
  <div
    slot="content"
    class="py-1 grid grid-cols-12-1fr items-center"
  >
    <span class="font-semibold mr-4">
      Metric
    </span>

    <div class="flex flex-wrap gap-y-1 gap-x-1">
      <b-select
        v-for="index in (showAllMeasurements ? 1 : numMeasurements)"
        :key="index"
        :value="showAllMeasurements ? '' : value.measurementsIds[index - 1]"
        dark
        sm
        @input="v => onInputMeasurementsIds(index - 1, v)"
      >
        <option
          v-if="multiple && index == 1 && measurements.length > 1 && measurements.length < maxMeasurements"
          value=""
        >All</option>
        <option
          v-for="m in (showAllMeasurements ? measurements : measurements.filter(m => m.id == value.measurementsIds[index - 1] || !value.measurementsIds.includes(m.id)))"
          :key="m.id"
          :value="m.id"
        >
          {{ m.name }}
        </option>
      </b-select>

      <div class="flex gap-x-1">
        <b-button
          v-if="numMeasurements < maxMeasurements && !showAllMeasurements && multiple"
          class="font-semibold"
          primary
          sm
          @click="numMeasurements++"
        >
          <font-awesome-icon
            :icon="faPlus"
          ></font-awesome-icon>
        </b-button>

        <b-button
          v-if="numMeasurements > 1 && !showAllMeasurements && multiple"
          class="font-semibold"
          primary
          sm
          @click="onMeasurementRemove()"
        >
          <font-awesome-icon
            :icon="faMinus"
          ></font-awesome-icon>
        </b-button>
      </div>
    </div>

    <p
      v-if="description != ''"
      class="col-span-full my-2 prose text-gray-200"
    >
      {{ description }}
    </p>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { CubeQuery, Measurement } from '~/klicker'
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    value: {
      type: Object as PropType<CubeQuery>,
      required: true
    },
    multiple: {
      type: Boolean,
      default: false
    },
    maxMeasurements: {
      type: Number,
      default: 10
    },
    options: {
      type: Array as PropType<string[]>,
      default: undefined,
    },
  },
  data() {
    return {
      numMeasurements: this.value.measurementsIds.length,
    }
  },
  methods: {
    onInputMeasurementsIds(index: number, m: string) {
      let measurementsIds: string[] = []
      if (m != '') {
        if (!this.showAllMeasurements) {
          measurementsIds = this.value.measurementsIds.slice()
        }
        // else: drop every measurement and keep only the new input
        measurementsIds[index] = m
      } else {
        measurementsIds = this.measurements.map(m => m.id)
      }

      this.$emit('input', <CubeQuery>{
        ...this.value,
        measurementsIds,
        sortId: measurementsIds[0],
      })
      this.numMeasurements = measurementsIds.length
    },
    onMeasurementRemove() {
      const measurementsIds = this.value.measurementsIds.slice()
      measurementsIds.pop()
      this.$emit('input', <CubeQuery>{
        ...this.value,
        measurementsIds,
      })
      this.numMeasurements--
    },
  },
  computed: {
    measurements(): Measurement[] {
      return this.$klicker.config[this.value.cubeId].measurements
        .filter(m => this.options == undefined || this.options.includes(m.id))
    },
    showAllMeasurements(): boolean {
      return this.value.measurementsIds.length == this.measurements.length && this.measurements.length > 1
    },
    description(): string {
      if (this.numMeasurements != 1) {
        return ''
      }
      return this.measurements.find(m => m.id == this.value.measurementsIds[0])?.description ?? ''
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
.grid-cols-12-1fr {
  grid-template-columns: 6rem 1fr;
}
</style>
