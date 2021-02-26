<template functional>
  <brawler-link
    v-if="'brawler' in props.row.dimensions || 'starpower' in props.row.dimensions || 'gadget' in props.row.dimensions"
    :brawler="(props.row.dimensionsRaw.brawler || {}).brawler_name || (props.row.dimensionsRaw.starpower || {}).brawler_name || (props.row.dimensionsRaw.gadget || {}).brawler_name"
    :starpower-name="props.row.dimensions.starpower"
    :starpower-id="(props.row.dimensionsRaw.starpower || {}).brawler_starpower_id"
    :gadget-name="props.row.dimensions.gadget"
    :gadget-id="(props.row.dimensionsRaw.gadget || {}).brawler_gadget_id"
    :caption="props.captioned"
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
    captioned: {
      type: Boolean
    },
  },
})
</script>
