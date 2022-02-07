<template>
  <input
    v-bind="$attrs"
    type="checkbox"
    :checked="$props.value"
    class="form-input rounded transition duration-100 ease-in-out focus:ring-0 bg-black/5 hover:bg-black/10 focus:bg-black/20 text-black/30 checked:text-black/40 dark:bg-white/5 dark:hover:bg-white/10 dark:focus:bg-white/20 dark:text-white/30 dark:checked:text-white/40"
    @input="$listeners.input && $listeners.input($event.target.checked)"
  >
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi'

export default defineComponent({
  props: {
    value: {
      type: Boolean
    },
  },
})
</script>
