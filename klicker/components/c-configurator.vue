<template>
  <b-card
    v-bind="card ?? {}"
    :title="translate('configurator.title')"
  >
    <template v-slot:content>
      <div class="flex flex-wrap items-center">
        <div class="grid grid-cols-[auto_auto] gap-6 items-center">
          <label
            v-if="configureCube"
            :for="id"
            class="inline"
          >
            {{ translate('configurator.source') }}
          </label>

          <div v-if="configureCube">
            <b-select
              :model-value="modelValue.cubeId"
              :id="id"
              sm
              @update:modelValue="onInputCubeId"
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
            v-if="configureMetrics"
            :options="configureMetricsOptions"
            :model-value="modelValue"
            :multiple="configureMultipleMetrics && !compareMode"
            @update:modelValue="s => $emit('update:modelValue', s)"
          ></c-metric>

          <c-dimension
            v-if="configureDimensions"
            :model-value="modelValue"
            @update:modelValue="s => $emit('update:modelValue', s)"
          ></c-dimension>

          <c-dimension
            v-if="configureDimensions && compareMode"
            :model-value="modelValue"
            comparing
            @update:modelValue="s => $emit('update:modelValue', s)"
          ></c-dimension>

          <label
            v-if="configureCompareMode && canCompare"
            class="col-span-2 flex items-center"
          >
            <b-checkbox v-model="compareMode"></b-checkbox>
            <span class="ml-2">{{ translate('configurator.comparison-mode') }}</span>
          </label>
        </div>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { CubeQuery, Cube, CubeComparingQuery } from '../types'
import CMetric from './c-metric.vue'
import CDimension from './c-dimension.vue'
import BCard from './ui/b-card.vue'
import BSelect from './ui/b-select.vue'
import BCheckbox from './ui/b-checkbox.vue'
import { computed, defineComponent, PropType, useId } from 'vue'
import { useKlickerConfig } from '../composables/klicker'

export default defineComponent({
  components: {
    CMetric,
    CDimension,
    BSelect,
    BCheckbox,
    BCard,
  },
  props: {
    modelValue: {
      type: Object as PropType<CubeQuery|CubeComparingQuery>,
      required: true
    },
    card: {
      type: undefined,
      required: false
    },
    configureCube: {
      type: Boolean,
      default: false
    },
    configureMetrics: {
      type: Boolean,
      default: false
    },
    configureMetricsOptions: {
      type: Array as PropType<string[]>,
      required: false
    },
    configureMultipleMetrics: {
      type: Boolean,
      default: false
    },
    configureDimensions: {
      type: Boolean,
      default: false
    },
    configureCompareMode: {
      type: Boolean,
      default: false
    },
  },
  emits: {
    ['update:modelValue'](value: CubeQuery|CubeComparingQuery) { return true },
  },
  setup(props, { emit }) {
    const { $klicker, translate } = useKlickerConfig()

    const onInputCubeId = (c: string) => {
      const newQuery: CubeQuery = {
        cubeId: c,
        slices: $klicker.config[c].defaultSliceValues,
        dimensionsIds: $klicker.config[c].defaultDimensionsIds,
        metricsIds: $klicker.config[c].defaultMetricIds,
        sortId: $klicker.config[c].defaultMetricIds[0],
      }
      emit('update:modelValue', newQuery)
    }

    const compareMode = computed({
      get(): boolean {
        return props.modelValue.comparing ? true : false
      },
      set(wantComparing: boolean) {
        const isComparing = props.modelValue.comparing ? true : false

        if (!isComparing && wantComparing) {
          const current = props.modelValue as CubeQuery
          const newQuery: CubeQuery = {
            cubeId: current.cubeId,
            slices: current.slices,
            dimensionsIds: current.dimensionsIds,
            metricsIds: [current.metricsIds[0]],
            sortId: current.metricsIds[0],
          }
          emit('update:modelValue', {
            ...newQuery,
            reference: newQuery,
            comparing: true,
          })
        }
        if (isComparing && !wantComparing) {
          const current = props.modelValue as CubeComparingQuery
          const newQuery: CubeQuery = {
            ...current,
            sortId: current.metricsIds[0],
          }
          delete (<any>newQuery).reference
          delete (<any>newQuery).comparing
          emit('update:modelValue', newQuery)
        }
      }
    })

    const cubes = computed<Cube[]>(() => Object.values($klicker.config))

    const canCompare = computed(() => {
      if (props.modelValue.comparing) {
        return true
      }

      const metrics = $klicker.config[props.modelValue.cubeId].metrics
      const query = props.modelValue as CubeQuery
      const selectedMetrics = metrics.filter(m => query.metricsIds.includes(m.id))
      return selectedMetrics.length == 1 && selectedMetrics[0].type == 'quantitative'
    })

    const id = useId()

    return {
      cubes,
      canCompare,
      compareMode,
      onInputCubeId,
      translate,
      id,
    }
  },
})
</script>
