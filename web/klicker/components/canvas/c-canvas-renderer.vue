<template>
  <div
    :style="{ width: `${report.width}px`, height: `${report.height}px` }"
    ref="container"
    class="overflow-hidden relative bg-gray-800"
  >
    <c-widget
      v-for="w in report.widgets"
      :key="w.id"
      :widget="w"
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
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { Report } from '~/klicker'
import CWidget from './c-widget.vue'

/**
 * Read-only view of a canvas.
 */
export default defineComponent({
  components: {
    CWidget,
  },
  props: {
    report: {
      type: Object as PropType<Report>,
      required: true
    },
  },
})
</script>
