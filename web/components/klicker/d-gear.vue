<template>
  <span v-if="'gear' in row.dimensions">
    {{ row.dimensions.gear }}
  </span>
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
