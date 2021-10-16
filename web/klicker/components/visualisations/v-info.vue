<template>
  <b-card
    v-if="measurements.length == 1"
    :title="title"
    dense
  >
    <p
      slot="content"
      class="md:h-16"
    >
      {{ description }}
    </p>
  </b-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Dimension, Measurement, MetaGridEntry } from '~/klicker'

export default Vue.extend({
  props: {
    dimensions: {
      type: Array as PropType<Dimension[]>,
      required: true
    },
    data: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true
    },
    measurements: {
      type: Array as PropType<Measurement[]>,
      required: true
    },
  },
  computed: {
    title(): string {
      return 'About ' + this.measurements[0].name
    },
    description(): string {
      return this.measurements[0].description
    },
  },
})
</script>
