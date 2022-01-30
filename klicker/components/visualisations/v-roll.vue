<template>
  <v-card-wrapper
    v-bind="$props"
    component="v-roll"
  >
    <div
      slot="content"
      class="h-full w-full overflow-x-auto bg-inherit"
    >
      <table class="h-full w-full bg-inherit border-separate border-spacing-0">
        <tbody class="bg-inherit">
          <tr class="bg-inherit">
            <th
              scope="row"
              class="font-normal text-sm text-left pt-2 pr-3 border-r border-gray-600 bg-inherit sticky left-0"
            >{{ dimensionName }}</th>
            <td
              v-for="row in rows"
              :key="row.id"
              class="text-left pt-2 pl-3"
            >
              <slot
                name="dimensions"
                :row="row.entry"
              >{{ row.title }}</slot>
            </td>
          </tr>

          <tr class="bg-inherit">
            <th
              scope="row"
              class="font-normal text-sm text-left pt-2 pr-3 border-r border-gray-600 bg-inherit sticky left-0"
            >{{ metricName }}</th>
            <td
              v-for="row in rows"
              :key="row.id"
              class="text-left pt-2 pl-3"
            >
              <slot
                :name="`metrics.${metric.id}`"
                :row="row.entry"
              >{{ row.text }}</slot>
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

export default defineComponent({
  components: {
    BCard,
    VCardWrapper,
  },
  name: 'VRoll',
  props: {
    ...VisualisationProps,
    elevation: {
      type: Number,
      required: false
    },
    long: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const { $klicker, dimensions, metrics, switchResponse } = useCubeResponseProps(props)

    const metric = computed(() => metrics.value[0])
    const dimension = computed(() => dimensions.value[0])

    const rows = computed(() =>
      switchResponse(response => response.data.map(e => ({
        id: e.id,
        entry: e,
        title: e.dimensions[dimension.value.id],
        text: e.metrics[metric.value.id],
      })), response => response.data.map(e => ({
        id: e.id,
        entry: e,
        title: e.dimensions[dimension.value.id],
        text: e.test.difference.difference,
      }))))

    const metricName = computed(() => $klicker.getName(metric.value, 'short'))
    const dimensionName = computed(() => $klicker.getName(dimension.value, 'short'))

    return {
      rows,
      metric,
      metricName,
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
