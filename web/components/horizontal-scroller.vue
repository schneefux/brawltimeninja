<template functional>
  <div
    :class="['overflow-x-auto flex items-center', {
      'md:items-end md:justify-center md:flex-wrap': props.expandOnDesktop,
    }]">
    <slot></slot>
  </div>
</template>


<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  functional: true,
  props: {
    expandOnDesktop: {
      type: Boolean
    },
  },
})
</script>
