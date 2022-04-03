<template>
  <v-card-wrapper
    v-bind="$props"
    component="v-roll"
  >
    <div
      slot="content"
      class="h-full w-full overflow-x-auto"
    >
      <table class="h-full w-full border-separate border-spacing-0">
        <tbody>
          <tr>
            <th
              scope="row"
              class="font-normal text-sm text-left pt-2 pb-1 pr-3 border-r border-gray-600 whitespace-nowrap"
            >{{ dimensionName }}</th>
            <d-auto
              v-for="title in headings"
              :key="title.id"
              :response="response"
              :row="title.entry"
              tag="td"
              class="text-left pt-2 pb-1 pl-3"
            ></d-auto>
          </tr>

          <tr
            v-for="row in body"
            :key="row.metricId"
          >
            <th
              scope="row"
              class="font-normal text-sm text-left pt-1 pr-3 border-r border-gray-600 whitespace-nowrap text-gray-800/75 dark:text-gray-200/75"
            >{{ row.metricName }}</th>
            <td
              v-for="column in row.columns"
              :key="column.id"
              class="text-left pt-1 pl-3 text-gray-800 dark:text-gray-200"
            >
              <m-auto
                :response="response"
                :row="column.entry"
                :metric-id="row.metricId"
              ></m-auto>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </v-card-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue-demi'
import { VisualisationProps } from '../../props'
import { useCubeResponseProps } from '../../composables/response'
import BCard from '../ui/b-card.vue'
import VCardWrapper from './v-card-wrapper.vue'
import DAuto from './d-auto.vue'
import MAuto from './m-auto.vue'

/**
 * Table visualisation that renders rows on the X axis
 */
export default defineComponent({
  name: 'VRoll',
  components: {
    BCard,
    VCardWrapper,
    DAuto,
    MAuto,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { $klicker, dimensions, metrics, switchResponse } = useCubeResponseProps(props)

    const dimension = computed(() => dimensions.value[0])
    const dimensionName = computed(() => $klicker.getName(dimension.value, 'short'))
    const headings = computed(() =>
      switchResponse(response => response.data.map(e => ({
        id: e.id,
        entry: e,
      })), response => response.data.map(e => ({
        id: e.id,
        entry: e,
      }))
    ))

    const body = computed(() =>
      switchResponse(response => metrics.value.map((metric) => ({
        metricId: metric.id,
        metricName: $klicker.getName(metric, 'short'),
        columns: response.data.map(e => ({
          id: `${metric.id}-${e.id}`,
          entry: e,
        }))
      })), response => ([{
        metricId: metrics.value[0].id,
        metricName: $klicker.getName(metrics.value[0], 'short'),
        columns: response.data.map(e => ({
          id: `${metrics.value[0].id}-${e.id}`,
          entry: e,
        }))
      }])
    ))

    return {
      headings,
      body,
      dimensionName,
    }
  },
})
</script>

<style scoped lang="postcss">
.border-spacing-0 {
  border-spacing: 0;
}
</style>
