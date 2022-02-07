<template>
  <input
    type="number"
    :value="value"
    class="form-input transition duration-100 ease-in-out rounded-2xl py-2 px-4 border-none focus:ring-0 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
    @input="$listeners.input && $listeners.input(parseInt($event.target.value))"
  >
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi'

export default defineComponent({
  props: {
    value: {
      type: undefined
    },
  },
})
</script>
