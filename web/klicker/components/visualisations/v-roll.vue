<template>
  <b-horizontal-scroller
    v-if="show"
    expand-on-desktop
  >
    <b-card
      v-for="(entry, index) in query.data"
      :key="entry.id"
      :elevation="elevation"
      :title="long ? entry.dimensions[query.state.dimensionsIds[0]] : undefined"
      :class="['flex-shrink-0', {
        'ml-auto': index == 0,
        'mr-auto': index == query.data.length - 1,
      }]"
      dense
    >
      <div
        slot="content"
        :class="{
          'flex items-center gap-2 my-1 mx-2': long,
        }"
      >
        <div class="mt-2 mx-auto flex-shrink-0">
          <slot
            name="dimensions"
            :row="entry"
          ></slot>
        </div>
        <table class="mx-auto my-1 text-2xs md:text-xs lg:text-base text-center">
          <tbody>
            <tr
              v-for="m in measurements"
              :key="m.id"
              class="whitespace-nowrap flex flex-col"
            >
              <td>
                {{ entry.measurements[m.id] }}
              </td>
              <td>
                {{ m.name }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </b-card>
  </b-horizontal-scroller>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs, useContext } from '@nuxtjs/composition-api'
import { CubeResponse } from '~/klicker'
import BCard from '~/klicker/components/ui/b-card.vue'
import BHorizontalScroller from '~/klicker/components/ui/b-horizontal-scroller.vue'

export default defineComponent({
  components: {
    BCard,
    BHorizontalScroller,
  },
  name: 'VRoll',
  props: {
    query: {
      type: Object as PropType<CubeResponse>,
      required: true
    },
    elevation: {
      type: Number
    },
    long: {
      type: Boolean
    },
  },
  setup(props) {
    const { $klicker } = useContext()
    const { query } = toRefs(props)

    const measurements = computed(() => $klicker.getMeasurements(query.value.state))

    const show = computed(() => query.value.state.dimensionsIds.length == 1
      && query.value.state.measurementsIds.length == 1
      && query.value.data.length > 1
      && query.value.data.length < 10)

    const measurementsNames = computed(() => measurements.value.map(m => ({
      id: m.id,
      name: $klicker.getName(m, 'short')
    })))

    return {
      show,
      measurements: measurementsNames,
    }
  },
})
</script>
