<template>
  <input
    v-bind="$attrs"
    type="checkbox"
    :class="{
      'bg-white/5 hover:bg-white/10 focus:bg-white/20 text-white/30 checked:text-white/40': dark,
    }"
    :checked="$props.value"
    class="form-input rounded transition duration-100 ease-in-out focus:ring-0"
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
    dark: {
      type: Boolean
    },
  },
})
</script>
