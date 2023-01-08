<template>
  <a :href="to">
    <slot></slot>
  </a>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    to: {
      type: String as PropType<string>,
      required: true,
    },
  },
  setup() {
    return {}
  },
})
</script>
