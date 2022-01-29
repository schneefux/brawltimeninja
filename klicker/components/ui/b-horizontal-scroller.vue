<template>
  <div
    :class="['overflow-x-auto flex items-center', {
      'md:justify-center md:flex-wrap': expandOnDesktop,
    }]"
  >
    <slot></slot>
  </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue-demi'

export default defineComponent({
  props: {
    expandOnDesktop: {
      type: Boolean
    },
  },
})
</script>
