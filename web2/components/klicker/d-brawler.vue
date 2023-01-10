<template>
  <brawler-link
    v-if="brawler != undefined"
    :brawler="brawler"
    :ally="ally"
    :starpower-name="row.dimensions.starpower"
    :starpower-id="(row.dimensionsRaw.starpower || {}).starpower"
    :gadget-name="row.dimensions.gadget"
    :gadget-id="(row.dimensionsRaw.gadget || {}).gadget"
    :captioned="captioned"
  ></brawler-link>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
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
  setup(props) {
    // Swap brawler and ally/enemy so that the ally/enemy will be large
    const brawler = computed(() => {
      if (props.row.dimensionsRaw.enemy != undefined) {
        return props.row.dimensionsRaw.enemy.enemy
      }
      if (props.row.dimensionsRaw.ally != undefined) {
        return props.row.dimensionsRaw.ally.ally
      }
      if (props.row.dimensionsRaw.brawler != undefined) {
        return props.row.dimensionsRaw.brawler.brawler
      }
      if (props.row.dimensionsRaw.starpower != undefined) {
        return props.row.dimensionsRaw.starpower.brawler
      }
      if (props.row.dimensionsRaw.gadget != undefined) {
        return props.row.dimensionsRaw.gadget.brawler
      }
      return undefined
    })

    const ally = computed(() => {
      if (props.row.dimensionsRaw.ally != undefined || props.row.dimensionsRaw.enemy != undefined) {
        return props.row.dimensionsRaw.brawler.brawler
      }
      return undefined
    })

    return {
      brawler,
      ally,
    }
  },
})
</script>
