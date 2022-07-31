<template>
  <component
    :is="tag"
    :class="{
      'dashboard': true,
      'dashboard--responsive': responsive,
    }"
  ><slot></slot></component>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  props: {
    tag: {
      type: String,
      default: 'div'
    },
    responsive: {
      type: Boolean,
      default: false
    },
  },
})
</script>
