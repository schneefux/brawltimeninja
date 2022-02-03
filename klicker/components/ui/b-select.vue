<template>
  <select
    :class="{
      'bg-inherit hover:bg-white/10 focus:bg-gray-800': dark,
    }"
    :value="value"
    class="form-select transition duration-100 ease-in-out rounded-2xl py-2 pl-4 pr-10 border-none focus:ring-0"
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
    dark: {
      type: Boolean
    },
  },
})
</script>

<style scoped lang="postcss">
select option {
  @apply py-1 px-px;
}
</style>
