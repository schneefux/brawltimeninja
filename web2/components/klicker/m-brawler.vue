<template>
  <brawler-link
    :brawler="row.metricsRaw.brawler"
  ></brawler-link>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
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
  },
})
</script>
