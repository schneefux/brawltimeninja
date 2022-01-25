<template>
  <div class="contents">
    <span class="font-semibold">
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

      <div
        v-if="!showAllMeasurements && multiple"
        class="flex gap-x-1"
      >
        <b-button
          v-if="numMeasurements < maxMeasurements"
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
          v-if="numMeasurements > 1"
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
      class="col-span-full mt-2 prose prose-invert"
    >
      {{ description }}
    </p>
  </div>
</template>

<script lang="ts">
import { CubeComparingQuery, CubeQuery } from '../types'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import { computed, defineComponent, PropType, ref } from 'vue-demi'
import { useKlicker } from '../composables/klicker'

export default defineComponent({
  components: {
    FontAwesomeIcon,
  },
  inheritAttrs: false,
  props: {
    value: {
      type: Object as PropType<CubeQuery|CubeComparingQuery>,
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
  setup(props, { emit }) {
    const { $klicker } = useKlicker()
    const numMeasurements = ref(props.value.measurementsIds.length)

    const measurements = computed(() => $klicker.config[props.value.cubeId].measurements
        .filter(m => props.options == undefined || props.options.includes(m.id)))
    const showAllMeasurements = computed(() => props.value.measurementsIds.length == measurements.value.length && measurements.value.length > 1)
    const description = computed(() => {
      if (numMeasurements.value != 1) {
        return ''
      }
      return measurements.value.find(m => m.id == props.value.measurementsIds[0])?.description ?? ''
    })

    const onInputMeasurementsIds = (index: number, m: string) => {
      let measurementsIds: string[] = []
      if (m != '') {
        if (!showAllMeasurements.value) {
          measurementsIds = props.value.measurementsIds.slice()
        }
        // else: drop every measurement and keep only the new input
        measurementsIds[index] = m
      } else {
        measurementsIds = measurements.value.map(m => m.id)
      }

      emit('input', <CubeQuery>{
        ...props.value,
        measurementsIds,
        sortId: measurementsIds[0],
      })
      numMeasurements.value = measurementsIds.length
    }

    const onMeasurementRemove = () => {
      const measurementsIds = props.value.measurementsIds.slice()
      measurementsIds.pop()
      emit('input', <CubeQuery>{
        ...props.value,
        measurementsIds,
      })
      numMeasurements.value--
    }

    return {
      description,
      measurements,
      numMeasurements,
      showAllMeasurements,
      onMeasurementRemove,
      onInputMeasurementsIds,
      faPlus,
      faMinus,
    }
  },
})
</script>
