<template>
  <textarea
    v-bind="$attrs"
    :class="{
      'bg-white/5 hover:bg-white/10': dark,
    }"
    :value="value"
    class="form-input transition duration-100 ease-in-out rounded-2xl py-2 px-4 border-none focus:ring-0"
    @input="$listeners.input && $listeners.input($event.target.value)"
  ></textarea>
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
