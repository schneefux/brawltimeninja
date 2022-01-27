<template>
  <div class="contents">
    <span class="font-semibold">
      {{ translate('configurator.metric') }}
    </span>

    <div class="flex flex-wrap gap-y-1 gap-x-1">
      <b-select
        v-for="index in (showAllMetrics ? 1 : numMetrics)"
        :key="index"
        :value="showAllMetrics ? '' : value.metricsIds[index - 1]"
        dark
        sm
        @input="v => onInputMetricsIds(index - 1, v)"
      >
        <option
          v-if="multiple && index == 1 && metrics.length > 1 && metrics.length < maxMetrics"
          value=""
        >{{ translate('option.all') }}</option>
        <option
          v-for="m in (showAllMetrics ? metrics : metrics.filter(m => m.id == value.metricsIds[index - 1] || !value.metricsIds.includes(m.id)))"
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
        <b-button
          v-if="numMetrics < maxMetrics"
          class="font-semibold"
          primary
          sm
          @click="numMetrics++"
        >
          <font-awesome-icon
            :icon="faPlus"
          ></font-awesome-icon>
        </b-button>

        <b-button
          v-if="numMetrics > 1"
          class="font-semibold"
          primary
          sm
          @click="onMetricRemove()"
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
import BSelect from './ui/b-select.vue'
import BButton from './ui/b-button.vue'

export default defineComponent({
  components: {
    FontAwesomeIcon,
    BSelect,
    BButton,
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
    maxMetrics: {
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
    const numMetrics = ref(props.value.metricsIds.length)

    const metrics = computed(() => $klicker.config[props.value.cubeId].metrics
        .filter(m => props.options == undefined || props.options.includes(m.id)))
    const showAllMetrics = computed(() => props.value.metricsIds.length == metrics.value.length && metrics.value.length > 1)
    const description = computed(() => {
      if (numMetrics.value != 1) {
        return ''
      }
      return metrics.value.find(m => m.id == props.value.metricsIds[0])?.description ?? ''
    })

    const onInputMetricsIds = (index: number, m: string) => {
      let metricsIds: string[] = []
      if (m != '') {
        if (!showAllMetrics.value) {
          metricsIds = props.value.metricsIds.slice()
        }
        // else: drop every metric and keep only the new input
        metricsIds[index] = m
      } else {
        metricsIds = metrics.value.map(m => m.id)
      }

      emit('input', <CubeQuery>{
        ...props.value,
        metricsIds,
        sortId: metricsIds[0],
      })
      numMetrics.value = metricsIds.length
    }

    const onMetricRemove = () => {
      const metricsIds = props.value.metricsIds.slice()
      metricsIds.pop()
      emit('input', <CubeQuery>{
        ...props.value,
        metricsIds,
      })
      numMetrics.value--
    }

    const translate = (key: string) => $klicker.$t(key)

    return {
      description,
      metrics,
      numMetrics,
      showAllMetrics,
      onMetricRemove,
      onInputMetricsIds,
      faPlus,
      faMinus,
      translate,
    }
  },
})
</script>
