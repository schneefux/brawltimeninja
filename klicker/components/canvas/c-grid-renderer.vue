<template>
  <div class="dashboard dashboard--responsive min-h-screen bg-gray-900 text-gray-200">
    <c-widget
      v-for="w in grid.widgets"
      :key="w.id"
      :widget="w"
      for-grid
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
    </c-widget>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue-demi'
import { Grid } from '../../types'
import CWidget from './c-widget.vue'

/**
 * Read-only view of a grid.
 */
export default defineComponent({
  components: {
    CWidget,
  },
  props: {
    grid: {
      type: Object as PropType<Grid>,
      required: true
    },
  },
})
</script>
