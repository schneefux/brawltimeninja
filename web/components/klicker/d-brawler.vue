<template functional>
  <!-- Swap brawler and ally so that the ally will be large -->
  <brawler-link
    v-if="'brawler' in props.row.dimensions || 'starpower' in props.row.dimensions || 'gadget' in props.row.dimensions"
    :brawler="(props.row.dimensionsRaw.ally || {}).ally || (props.row.dimensionsRaw.brawler || {}).brawler || (props.row.dimensionsRaw.starpower || {}).brawler || (props.row.dimensionsRaw.gadget || {}).brawler"
    :ally="props.row.dimensionsRaw.ally != undefined ? (props.row.dimensionsRaw.brawler || {}).brawler : undefined"
    :starpower-name="props.row.dimensions.starpower"
    :starpower-id="(props.row.dimensionsRaw.starpower || {}).starpower"
    :gadget-name="props.row.dimensions.gadget"
    :gadget-id="(props.row.dimensionsRaw.gadget || {}).gadget"
    :captioned="props.captioned"
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
    captioned: {
      type: Boolean
    },
  },
})
</script>
