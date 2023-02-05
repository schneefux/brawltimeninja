<template>
  <span
    class="w-16 md:w-24"
  >{{ dateFormatted }}</span>
</template>

<script lang="ts">
import { format, parseISO } from 'date-fns'
import { defineComponent, computed } from 'vue';

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
  setup(props) {
    const dateFormatted = computed(() => format(parseISO(props.row.dimensions.season), 'PP'))

    return {
      dateFormatted,
    }
  },
})
</script>
