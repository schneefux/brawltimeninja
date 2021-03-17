<template>
  <div
    v-if="show"
    class="flex justify-center"
  >
    <card
      v-for="entry in data"
      :key="entry.id"
      :elevation="elevation"
      dense
    >
      <div slot="content">
        <div class="mx-auto">
          <slot
            name="dimensions"
            :row="entry"
          ></slot>
        </div>
        <table class="mx-auto mt-1 text-2xs md:text-xs lg:text-base text-center">
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
                {{ $t('metric.' + m.id + '.short') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </card>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Dimension, Measurement } from '~/lib/cube'
import { MetaGridEntry } from '@/lib/util'

export default Vue.extend({
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
  },
  computed: {
    show(): boolean {
      return this.dimensions.length == 1 && this.measurements.length == 1 && this.data.length > 1 && this.data.length < 10
    },
  },
})
</script>
