<template>
  <div class="w-full">
    <v-auto
      v-bind="$props"
      :card="{ loading, fullHeight: true, elevation: 2 }"
      class="w-full dashboard dashboard--responsive"
      for-grid
      all
    >
      <template
        v-for="(_, name) in $scopedSlots"
        v-slot:[name]="data"
      >
        <slot
          :name="name"
          v-bind="data"
        ></slot>
      </template>
    </v-auto>

    <c-share></c-share>
  </div>
</template>

<script lang="ts">
import { VisualisationProps } from '@schneefux/klicker/props'
import { VAuto } from '@schneefux/klicker/components'
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  components: {
    VAuto,
  },
  props: {
    ...VisualisationProps,
  },
})
</script>
