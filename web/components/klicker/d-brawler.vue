<template>
  <!-- Swap brawler and ally so that the ally will be large -->
  <brawler-link
    v-if="'brawler' in row.dimensions || 'starpower' in row.dimensions || 'gadget' in row.dimensions"
    :brawler="(row.dimensionsRaw.ally || {}).ally || (row.dimensionsRaw.brawler || {}).brawler || (row.dimensionsRaw.starpower || {}).brawler || (row.dimensionsRaw.gadget || {}).brawler"
    :ally="row.dimensionsRaw.ally != undefined ? (row.dimensionsRaw.brawler || {}).brawler : undefined"
    :starpower-name="row.dimensions.starpower"
    :starpower-id="(row.dimensionsRaw.starpower || {}).starpower"
    :gadget-name="row.dimensions.gadget"
    :gadget-id="(row.dimensionsRaw.gadget || {}).gadget"
    :captioned="captioned"
  ></brawler-link>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { MetaGridEntry } from '@schneefux/klicker/types'

export default defineComponent({
  props: {
    row: {
      type: Object as PropType<MetaGridEntry>,
      required: true
    },
    captioned: {
      type: Boolean
    },
  },
})
</script>
