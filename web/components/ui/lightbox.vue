<template>
  <div
    v-if="value"
    class="fixed inset-0 z-50 bg-gray-900 bg-opacity-75"
  >
    <button
      class="absolute top-0 right-0 mr-10 mt-4 text-white text-5xl"
      @click="$emit('input', false)"
    >
      &times;
    </button>
    <div
      class="h-full flex justify-center items-center pt-20 pb-8 px-4"
      @click.self="$emit('input', false)"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    value: {
      type: Boolean,
      required: true
    },
  },
})
</script>
