<template>
  <div
    class="dashboard min-h-screen bg-background text-text"
    :style="{
      '--columns': grid.columns,
    }"
    :class="{
      'dashboard--fixed': grid.columns != undefined,
      'dashboard--responsive': grid.columns == undefined,
    }"
  >
    <c-widget
      v-for="w in grid.widgets"
      :key="w.id"
      :widget="w"
      for-grid
    ></c-widget>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
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
