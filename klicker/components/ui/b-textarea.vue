<template>
  <textarea
    v-bind="$attrs"
    :value="value"
    class="form-input transition duration-100 ease-in-out rounded-2xl py-2 px-4 border-none ring-2 focus:ring-2 bg-contrast/5 ring-contrast/10 hover:ring-contrast/20"
    @input="$listeners.input && $listeners.input($event.target.value)"
  ></textarea>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    value: {
      type: undefined
    },
  },
})
</script>
