<template>
  <!-- Swap brawler and ally/enemy so that the ally/enemy will be large -->
  <brawler-link
    :brawler="(row.dimensionsRaw.enemy || {}).enemy || (row.dimensionsRaw.ally || {}).ally || (row.dimensionsRaw.brawler || {}).brawler || (row.dimensionsRaw.starpower || {}).brawler || (row.dimensionsRaw.gadget || {}).brawler"
    :ally="row.dimensionsRaw.ally != undefined || row.dimensionsRaw.enemy != undefined ? (row.dimensionsRaw.brawler || {}).brawler : undefined"
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
import BrawlerLink from '~/components/brawler/brawler-link.vue'

export default defineComponent({
  components: {
    BrawlerLink,
  },
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
