<template>
  <input
    type="number"
    :value="value"
    class="form-input transition duration-100 ease-in-out rounded-2xl py-2 px-4 border-none ring-2 focus:ring-2 ring-contrast/10 focus:ring-contrast/20 hover:ring-contrast/20 bg-contrast/5"
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
