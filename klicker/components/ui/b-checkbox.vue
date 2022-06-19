<template>
  <input
    v-bind="$attrs"
    type="checkbox"
    :checked="$props.value"
    class="form-input rounded transition duration-100 ease-in-out focus:ring-0 bg-contrast/5 hover:bg-contrast/10 focus:bg-contrast/20 text-contrast/30 checked:text-contrast/40"
    @input="$listeners.input && $listeners.input($event.target.checked)"
  >
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  props: {
    value: {
      type: Boolean
    },
  },
})
</script>
