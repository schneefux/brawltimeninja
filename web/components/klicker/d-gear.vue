<template>
  <div class="flex items-center">
    <media-img
      :path="`/gears/${row.dimensionsRaw.gear.gearName.toLowerCase()}_1`"
      :alt="row.dimensions.gear"
      size="80"
      clazz="h-8"
      wrapper-class="shrink-0"
    ></media-img>
    <span
      v-if="captioned"
      class="ml-2"
    >{{ row.dimensions.gear }}</span>
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
    captioned: {
      type: Boolean
    },
  },
})
</script>
