<template>
  <absolute-time
    :timestamp="$props.row.dimensions.season"
    format-str="PP"
    class="w-16 md:w-24"
  ></absolute-time>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    row: {
      type: Object,
      required: true
    },
    captioned: {
      type: Boolean
    },
  },
})
</script>
