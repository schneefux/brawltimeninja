<template>
  <div
    v-if="'team' in row.dimensions"
    class="flex items-center"
  >
    <brawler-team
      :brawlers="row.dimensionsRaw.team.team"
      class="shrink-0 w-20"
      height="h-8"
      width="w-8"
      snug="-ml-3"
    ></brawler-team>
    <span class="tracking-tight leading-tight">{{ row.dimensions.team }}</span>
  </div>
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
  },
})
</script>
