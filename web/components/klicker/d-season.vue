<template functional>
  <span
    class="w-16 md:w-24"
    :class="['w-16 md:w-24', data.class, data.staticClass]"
    :style="data.staticStyle"
  >{{ props.formatDate(props.row.dimensions.season) }}</span>
</template>

<script lang="ts">
import Vue from 'vue'
import { format, parseISO } from 'date-fns'

export default Vue.extend({
  functional: true,
  props: {
    row: {
      type: Object,
      required: true
    },
    captioned: {
      type: Boolean
    },
    formatDate: {
      type: Function,
      default: (d: string) => format(parseISO(d), 'PP')
    },
  },
})
</script>
