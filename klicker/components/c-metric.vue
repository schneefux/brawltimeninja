<template>
  <div class="contents">
    <label :for="`${prefix}-1`">
      {{ translate('configurator.metric') }}
    </label>

    <div class="flex flex-wrap gap-4">
      <b-select
        v-for="index in (showAllMetrics ? 1 : numMetrics)"
        :key="index"
        :model-value="showAllMetrics ? '' : modelValue.metricsIds[index - 1]"
        :id="`${prefix}-${index}`"
        @update:modelValue="v => onInputMetricsIds(index - 1, v)"
      >
        <option
          v-if="multiple && index == 1 && metrics.length > 1 && metrics.length < maxMetrics"
          value=""
        >{{ translate('option.all') }}</option>
        <option
          v-for="m in (showAllMetrics ? metrics : metrics.filter(m => m.id == modelValue.metricsIds[index - 1] || !modelValue.metricsIds.includes(m.id)))"
          :key="m.id"
          :value="m.id"
        >
          {{ m.name }}
        </option>
      </b-select>

      <div
        v-if="!showAllMetrics && multiple"
        class="flex gap-x-1"
      >
        <button
          v-if="numMetrics > 1"
          class="w-10 h-10"
          @click="onMetricRemove()"
        >
          <fa :icon="faMinus"></fa>
        </button>

        <button
          v-if="numMetrics < maxMetrics"
          class="w-10 h-10"
          @click="numMetrics++"
        >
          <fa :icon="faPlus"></fa>
        </button>
      </div>

      <button
        v-if="description != ''"
        class="w-10 h-10"
        @click="tooltipOpen = !tooltipOpen"
      >
        <fa :icon="faQuestion"></fa>
      </button>
    </div>

    <b-lightbox v-model="tooltipOpen">
      <b-card
        :elevation="0"
        class="w-full max-w-md"
      >
        <template v-slot:content>
          <p class="my-2">
            {{ description }}
          </p>
        </template>
      </b-card>
    </b-lightbox>
  </div>
</template>

<script lang="ts">
import { CubeComparingQuery, CubeQuery } from '../types'
import Fa from './fa.vue'
import { faMinus, faPlus, faQuestion } from '@fortawesome/free-solid-svg-icons'
import { computed, defineComponent, PropType, ref, useId } from 'vue'
import { useKlickerConfig } from '../composables/klicker'
import BSelect from './ui/b-select.vue'
import BLightbox from './ui/b-lightbox.vue'
import BCard from './ui/b-card.vue'

export default defineComponent({
  components: {
    Fa,
    BSelect,
    BLightbox,
    BCard,
  },
  props: {
    modelValue: {
      type: Object as PropType<CubeQuery|CubeComparingQuery>,
      required: true
    },
    multiple: {
      type: Boolean,
      default: false
    },
    maxMetrics: {
      type: Number,
      default: 10
    },
    options: {
      type: Array as PropType<string[]>,
      default: undefined,
    },
  },
  emits: {
    ['update:modelValue'](value: CubeQuery|CubeComparingQuery) { return true },
  },
  setup(props, { emit }) {
    const { $klicker, translate } = useKlickerConfig()
    const numMetrics = ref(props.modelValue.metricsIds.length)

    const metrics = computed(() => $klicker.config[props.modelValue.cubeId].metrics
        .filter(m => props.options == undefined || props.options.includes(m.id)))
    const showAllMetrics = computed(() => props.modelValue.metricsIds.length == metrics.value.length && metrics.value.length > 1)
    const description = computed(() => {
      if (numMetrics.value != 1) {
        return ''
      }
      return metrics.value.find(m => m.id == props.modelValue.metricsIds[0])?.description ?? ''
    })

    const onInputMetricsIds = (index: number, m: string) => {
      let metricsIds: string[] = []
      if (m != '') {
        if (!showAllMetrics.value) {
          metricsIds = props.modelValue.metricsIds.slice()
        }
        // else: drop every metric and keep only the new input
        metricsIds[index] = m
      } else {
        metricsIds = metrics.value.map(m => m.id)
      }

      const sortId = metricsIds[0]
      if (props.modelValue.comparing) {
        const query = props.modelValue as CubeComparingQuery
        emit('update:modelValue', {
          ...query,
          metricsIds,
          sortId,
          reference: {
            ...query.reference,
            metricsIds,
            sortId,
          },
        })
      } else {
        const query = props.modelValue as CubeQuery
        emit('update:modelValue', {
          ...query,
          metricsIds,
          sortId,
        })
      }

      numMetrics.value = metricsIds.length
    }

    const onMetricRemove = () => {
      const metricsIds = props.modelValue.metricsIds.slice()
      metricsIds.pop()

      emit('update:modelValue', <CubeQuery>{
        ...props.modelValue,
        metricsIds,
      })
      numMetrics.value--
    }

    const tooltipOpen = ref(false)

    const prefix = useId()

    return {
      description,
      metrics,
      numMetrics,
      tooltipOpen,
      showAllMetrics,
      onMetricRemove,
      onInputMetricsIds,
      faPlus,
      faMinus,
      faQuestion,
      translate,
      prefix,
    }
  },
})
</script>
