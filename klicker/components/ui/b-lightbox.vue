<template>
  <Teleport v-if="modelValue" to="body">
    <div
      class="fixed z-50 inset-0 bg-background/75 overflow-y-auto overscroll-contain"
      v-bind="$attrs"
    >
      <div
        class="h-full flex justify-center items-center pt-20 pb-8 px-4"
        @click.self="$emit('update:modelValue', false)"
      >
        <div class="max-w-full">
          <slot></slot>
        </div>
      </div>

      <button
        class="absolute top-0 right-0 mr-10 mt-4 text-white text-5xl"
        aria-label="close"
        @click="$emit('update:modelValue', false)"
      >
        <fa :icon="faTimes"></fa>
      </button>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Fa from '../fa.vue'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

export default defineComponent({
  inheritAttrs: false,
  components: {
    Fa,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
  },
  emits: {
    ['update:modelValue'](value: boolean) { return true },
  },
  setup() {
    return {
      faTimes,
    }
  },
})
</script>
