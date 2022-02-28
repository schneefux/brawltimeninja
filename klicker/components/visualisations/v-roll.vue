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
            <td
              v-for="title in headings"
              :key="title.id"
              class="text-left pt-2 pb-1 pl-3"
            >
              <slot
                name="dimensions"
                :row="title.entry"
              >{{ title.text }}</slot>
            </td>
          </tr>

          <tr
            v-for="row in body"
            :key="row.metricId"
          >
            <th
              scope="row"
              class="font-normal text-sm text-left pt-1 pr-3 border-r border-gray-600 whitespace-nowrap"
            >{{ row.metricName }}</th>
            <td
              v-for="column in row.columns"
              :key="column.id"
              class="text-left pt-1 pl-3"
            >
              <slot
                :name="`metrics.${row.metricId}`"
                :row="column.entry"
              >{{ column.text }}</slot>
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

/**
 * Table visualisation that renders rows on the X axis
 */
export default defineComponent({
  name: 'VRoll',
  components: {
    BCard,
    VCardWrapper,
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
        text: e.dimensions[dimension.value.id],
      })), response => response.data.map(e => ({
        id: e.id,
        entry: e,
        text: e.dimensions[dimension.value.id],
      }))
    ))

    const body = computed(() =>
      switchResponse(response => metrics.value.map((metric) => ({
        metricId: metric.id,
        metricName: $klicker.getName(metric, 'short'),
        columns: response.data.map(e => ({
          id: `${metric.id}-${e.id}`,
          entry: e,
          text: e.metrics[metric.id],
        }))
      })), response => ([{
        metricId: metrics.value[0].id,
        metricName: $klicker.getName(metrics.value[0], 'short'),
        columns: response.data.map(e => ({
          id: `${metrics.value[0].id}-${e.id}`,
          entry: e,
          text: e.test.difference.difference,
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
