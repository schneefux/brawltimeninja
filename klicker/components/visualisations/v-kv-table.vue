<template>
  <component
    :is="vwrapper.is"
    v-bind="vwrapper.props"
  >
    <template v-slot:content>
      <b-kv-table
        id-key="id"
        :rows="rows"
        :data="data"
      >
        <template
          v-for="m in metrics"
          v-slot:[`metrics.${m.id}`]="{ row }"
          :key="m.id"
        >
          <m-auto
            :response="response"
            :metric-id="m.id"
            :row="row"
          ></m-auto>
        </template>

        <template
          v-for="m in metrics"
          v-slot:[`test.reference.metrics.${m.id}`]="{ row }"
          :key="`${m.id}-reference`"
        >
          <m-auto
            :response="response"
            :metric-id="m.id"
            :row="row.test.reference"
          ></m-auto>
        </template>

        <template v-slot:dimensions="{ row }">
          <d-auto
            :response="response"
            :row="row"
          ></d-auto>
        </template>
      </b-kv-table>
    </template>
  </component>
</template>

<script lang="ts">
import { computed, defineComponent, toRef } from 'vue'
import { VisualisationProps } from '../../props'
import { useCubeResponseProps } from '../../composables/response'
import BKvTable, { Row } from '../ui/b-kv-table.vue'
import DAuto from './d-auto.vue'
import MAuto from './m-auto.vue'
import { useKlickerConfig } from '../../composables/klicker'
import { useVWrapper, vwrappers } from '../../composables/vwrapper'

/**
 * Table visualisation with metrics on the Y axis and a single value on the X axis
 */
export default defineComponent({
  components: {
    BKvTable,
    DAuto,
    MAuto,
    ...vwrappers,
  },
  name: 'VKvTable',
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { translate } = useKlickerConfig()
    const { $klicker, metrics, switchResponse } = useCubeResponseProps(props)

    const rows = computed<Row[]>(() =>
      switchResponse(
        response => metrics.value.map(m => ({
          title: $klicker.getName(translate, m),
          key: `metrics.${m.id}`,
          slot: `metrics.${m.id}`,
        })),
        response => metrics.value.flatMap(m => [{
          title: (response.query.name ?? translate('comparison.dataset.test')) + ' ' + $klicker.getName(translate, m),
          key: `metrics.${m.id}`,
          slot: `metrics.${m.id}`,
        }, {
          title: (response.query.reference.name ?? translate('comparison.dataset.reference')) + ' ' + $klicker.getName(translate, m),
          key: `test.reference.metrics.${m.id}`,
          slot: `test.reference.metrics.${m.id}`,
        }])
      )
    )

    const data = computed(() => props.response.data[0])

    const vwrapper = useVWrapper(toRef(props, 'card'), toRef(props, 'loading'))

    return {
      vwrapper,
      metrics,
      rows,
      data,
    }
  },
})
</script>
