<template>
  <b-horizontal-scroller
    v-if="show"
    expand-on-desktop
  >
    <b-card
      v-for="entry in data"
      :key="entry.id"
      :elevation="elevation"
      :title="long ? entry.dimensions[dimensions[0].id] : undefined"
      class="flex-shrink-0"
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
                {{ $klicker.getName(m, 'short') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </b-card>
  </b-horizontal-scroller>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Dimension, Measurement, MetaGridEntry } from '~/klicker'
import BCard from '~/klicker/components/ui/b-card.vue'
import BHorizontalScroller from '~/klicker/components/ui/b-horizontal-scroller.vue'

export default Vue.extend({
  components: {
    BCard,
    BHorizontalScroller,
  },
  name: 'VRoll',
  props: {
    dimensions: {
      type: Array as PropType<Dimension[]>,
      required: true
    },
    measurements: {
      type: Array as PropType<Measurement[]>,
      required: true
    },
    data: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true,
    },
    elevation: {
      type: Number
    },
    long: {
      type: Boolean
    },
  },
  computed: {
    show(): boolean {
      return this.dimensions.length == 1 && this.measurements.length == 1 && this.data.length > 1 && this.data.length < 10
    },
  },
})
</script>
