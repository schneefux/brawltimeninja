<template>
  <textarea
    v-bind="$attrs"
    :value="modelValue"
    class="form-input transition duration-100 ease-in-out rounded-2xl py-2 px-4 border-none ring-2 focus:ring-2 bg-contrast/5 ring-contrast/10 hover:ring-contrast/20"
    @input="$attrs.onInput && $attrs.onInput($event.target.value)"
  ></textarea>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    modelValue: {
      type: undefined
    },
  },
})
</script>
