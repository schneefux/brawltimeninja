<template functional>
  <brawler-link
    :brawler="props.row.measurementsRaw.brawler"
    :class="[data.class, data.staticClass]"
    :style="data.staticStyle"
  ></brawler-link>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  functional: true,
  props: {
    row: {
      type: Object,
      required: true
    },
  },
})
</script>
