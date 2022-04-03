<template>
  <figure class="flex items-center">
    <brawler-team
      :brawlers="row.dimensionsRaw.team.team"
      class="shrink-0 w-20"
    ></brawler-team>
    <figcaption
      class="ml-1 leading-tight"
    >{{ row.dimensions.team }}</figcaption>
  </figure>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { MetaGridEntry } from '@schneefux/klicker/types'
import BrawlerTeam from '~/components/brawler/brawler-team.vue'

export default defineComponent({
  components: {
    BrawlerTeam,
  },
  props: {
    row: {
      type: Object as PropType<MetaGridEntry>,
      required: true
    },
  },
})
</script>
