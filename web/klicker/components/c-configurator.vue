<template>
  <b-card
    v-bind="card"
    :title="$t('configurator.title')"
  >
    <div
      slot="content"
      class="flex flex-wrap items-center"
    >
      <div class="grid grid-cols-[auto,auto] gap-x-4 gap-y-2 my-1 items-center">
        <h1 class="inline font-semibold">
          Source
        </h1>

        <div>
          <b-select
            :value="value.cubeId"
            dark
            sm
            @input="onInputCubeId"
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
          :multiple="!compareMode"
          @input="s => $emit('input', s)"
        ></c-metric>

        <c-dimension
          :value="value"
          @input="s => $emit('input', s)"
        ></c-dimension>

        <c-dimension
          v-if="compareMode"
          :value="value"
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
      </div>
    </div>
  </b-card>
</template>

<script lang="ts">
import { CubeQuery, Cube, CubeComparingQuery } from '~/klicker'
import CMetric from '~/klicker/components/c-metric.vue'
import CDimension from '~/klicker/components/c-dimension.vue'
import BSelect from '~/klicker/components/ui/b-select.vue'
import BCheckbox from '~/klicker/components/ui/b-checkbox.vue'
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import { computed, defineComponent, PropType, ref, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
  components: {
    CMetric,
    CDimension,
    BSelect,
    BCheckbox,
  },
  props: {
    value: {
      type: Object as PropType<CubeQuery|CubeComparingQuery>,
      required: true
    },
    card: {
      type: undefined,
      required: false
    },
  },
  setup(props, { emit }) {
    const { $klicker } = useContext()

    const onInputCubeId = (c: string) => {
      // filter & keep old slice values that exist in the new cube too
      const slicesDefaults = Object.assign({},
        $klicker.config[c].defaultSliceValues,
        Object.fromEntries(
          Object.entries(props.value.slices)
            .filter(([key, value]) => $klicker.config[c].slices.some(s => s.id == key))
        ))

      const newQuery: CubeQuery = {
        cubeId: c,
        slices: slicesDefaults,
        dimensionsIds: $klicker.config[c].defaultDimensionsIds,
        measurementsIds: $klicker.config[c].defaultMeasurementIds,
        sortId: $klicker.config[c].defaultMeasurementIds[0],
      }
      emit('input', newQuery)
    }

    const compareMode = computed({
      get(): boolean {
        return props.value.comparing ? true : false
      },
      set(wantComparing: boolean) {
        const isComparing = props.value.comparing ? true : false

        if (!isComparing && wantComparing) {
          const current = props.value as CubeQuery
          const newQuery: CubeQuery = {
            cubeId: current.cubeId,
            slices: current.slices,
            dimensionsIds: current.dimensionsIds,
            measurementsIds: [current.measurementsIds[0]],
            sortId: current.measurementsIds[0],
          }
          emit('input', <CubeComparingQuery>{
            ...newQuery,
            reference: newQuery,
            comparing: true,
          })
        }
        if (isComparing && !wantComparing) {
          const current = props.value as CubeComparingQuery
          const newQuery: CubeQuery = {
            ...current,
            sortId: current.measurementsIds[0],
          }
          delete (<any>newQuery).reference
          delete (<any>newQuery).comparing
          emit('input', newQuery)
        }
      }
    })

    const cubes = computed<Cube[]>(() => Object.values($klicker.config))

    const canCompare = computed(() => {
      if (props.value.comparing) {
        return true
      }

      const measurements = $klicker.config[props.value.cubeId].measurements
      const query = props.value as CubeQuery
      const selectedMeasurements = measurements.filter(m => query.measurementsIds.includes(m.id))
      return selectedMeasurements.length == 1 && selectedMeasurements[0].type == 'quantitative'
    })

    const prefix = Math.random().toString().slice(2)

    return {
      cubes,
      canCompare,
      compareMode,
      onInputCubeId,
      prefix,
      faPlus,
      faMinus,
    }
  },
})
</script>

<style lang="postcss" scoped>
.grid-cols-20-1fr {
  grid-template-columns: 10rem 1fr;
}

.grid-cols-10-1fr {
  grid-template-columns: 5rem 1fr;
}
</style>
