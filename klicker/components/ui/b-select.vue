<template>
  <select
    :value="value"
    class="form-select transition duration-100 ease-in-out rounded-2xl py-2 pl-4 pr-10 border-none bg-black/5 dark:bg-white/5 ring-2 focus:ring-2 ring-black/10 hover:ring-black/20 focus:bg-gray-200 dark:ring-white/10 dark:hover:ring-white/20 dark:focus:bg-gray-800"
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
select option {
  @apply py-1 px-px;
}
</style>
