<template>
  <div
    :class="containerClass"
    ref="container"
    class="ml-4 inline-flex items-center"
  >
    <fa
      :icon="faSearch"
      class="-mr-6"
    ></fa>
    <b-textbox
      v-model="filter"
      ref="search"
      :class="inputClass"
      type="search"
      aria-label="search"
      autocomplete="off"
      class="pl-8 h-6 w-full"
      @focus="$emit('update:modelValue', true)"
      @keyup.enter="$emit('enter')"
    ></b-textbox>

    <div
      v-if="modelValue"
      class="absolute inset-x-0 z-10"
      :class="popupClass"
    >
      <slot :query="filter"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, useTemplateRef } from 'vue'
import BTextbox from './b-textbox.vue'
import Fa from '../fa.vue'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { onKeyStroke, onClickOutside } from '@vueuse/core'

export default defineComponent({
  components: {
    Fa,
    BTextbox,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    containerClass: {
      type: String,
      default: 'relative'
    },
    inputClass: {
      type: String,
      default: ''
    },
    popupClass: {
      type: String,
      default: 'top-6'
    },
  },
  emits: {
    ['enter']() { return true },
    ['update:modelValue'](value: Boolean) { return true },
  },
  setup(props, { emit }) {
    const filter = ref('')

    const searchRef = useTemplateRef<InstanceType<typeof BTextbox>>('search')
    onKeyStroke(
      (event) => (event.metaKey || event.ctrlKey) && event.key == 'k',
      () => (searchRef.value!.$el as HTMLInputElement).focus(),
    )

    const reset = () => filter.value = ''

    const containerRef = useTemplateRef<HTMLElement>('container')
    onClickOutside(containerRef, () => emit('update:modelValue', false), {
      capture: true,
    })

    return {
      filter,
      faSearch,
      faTimes,
      reset,
    }
  },
})
</script>
