<template>
  <card
    v-if="measurements.length == 1"
    v-bind="$attrs"
    :title="`About ${measurements[0].name}`"
    xl
    dense
  >
    <p
      slot="content"
      class="text-lg"
    >
      {{ measurements[0].description }}
    </p>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Dimension, Measurement } from '~/lib/cube'
import { MetaGridEntry } from '~/lib/util'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    data: {
      type: Array as PropType<MetaGridEntry[]>
    },
    dimensions: {
      type: Array as PropType<Dimension[]>,
      required: true
    },
    measurements: {
      type: Array as PropType<Measurement[]>,
      required: true
    },
  },
})
</script>
