<template>
  <select
    :value="value"
    class="max-w-full form-select transition duration-100 ease-in-out rounded-2xl py-2 pl-4 pr-10 border-none bg-contrast/5 ring-2 ring-contrast/10 focus:ring-2 focus:ring-contrast/20 hover:ring-contrast/20 style-options"
    @input="$listeners.input && $listeners.input($event.target.value)"
  >
    <slot></slot>
  </select>
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

<style scoped lang="postcss">
.style-options option {
  @apply py-1 px-px bg-background text-text;
}
</style>
