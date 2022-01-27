<template>
  <b-card
    v-bind="card"
    :title="translate('configurator.title')"
  >
    <div
      slot="content"
      class="flex flex-wrap items-center"
    >
      <div class="grid grid-cols-[auto,auto] gap-x-4 gap-y-2 my-1 items-center">
        <h1 class="inline font-semibold">
          {{ translate('configurator.source') }}
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
          <b-checkbox dark v-model="compareMode"></b-checkbox>
          <span class="ml-2">{{ translate('configurator.comparison-mode') }}</span>
        </label>
      </div>
    </div>
  </b-card>
</template>

<script lang="ts">
import { CubeQuery, Cube, CubeComparingQuery } from '../types'
import CMetric from './c-metric.vue'
import CDimension from './c-dimension.vue'
import BCard from './ui/b-card.vue'
import BSelect from './ui/b-select.vue'
import BCheckbox from './ui/b-checkbox.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'
import { computed, defineComponent, PropType } from 'vue-demi'
import { useKlicker } from '../composables/klicker'

export default defineComponent({
  components: {
    FontAwesomeIcon,
    CMetric,
    CDimension,
    BSelect,
    BCheckbox,
    BCard,
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
    const { $klicker } = useKlicker()

    const onInputCubeId = (c: string) => {
      const newQuery: CubeQuery = {
        cubeId: c,
        slices: $klicker.config[c].defaultSliceValues,
        dimensionsIds: $klicker.config[c].defaultDimensionsIds,
        metricsIds: $klicker.config[c].defaultMetricIds,
        sortId: $klicker.config[c].defaultMetricIds[0],
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
            metricsIds: [current.metricsIds[0]],
            sortId: current.metricsIds[0],
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
            sortId: current.metricsIds[0],
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

      const metrics = $klicker.config[props.value.cubeId].metrics
      const query = props.value as CubeQuery
      const selectedMetrics = metrics.filter(m => query.metricsIds.includes(m.id))
      return selectedMetrics.length == 1 && selectedMetrics[0].type == 'quantitative'
    })

    const prefix = Math.random().toString().slice(2)

    const translate = (key: string) => $klicker.$t(key)

    return {
      cubes,
      canCompare,
      compareMode,
      onInputCubeId,
      prefix,
      faPlus,
      faMinus,
      translate,
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
