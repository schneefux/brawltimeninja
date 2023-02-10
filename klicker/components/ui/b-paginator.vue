<template>
  <div class="flex justify-center">
    <button
      v-show="page != 0"
      class="w-8 text-center"
      aria-label="previous"
      @click.stop="page--"
    >
      <fa :icon="faCaretLeft"></fa>
    </button>

    <span
      class="whitespace-nowrap"
      :class="{
        'ml-8': page == 0,
        'mr-8': page == pages - 1,
      }"
    >{{ page + 1 }} / {{ pages }}</span>

    <button
      v-show="page != pages - 1"
      class="w-8 text-center"
      aria-label="next"
      @click.stop="page++"
    >
      <fa :icon="faCaretRight"></fa>
    </button>
  </div>
</template>

<script lang="ts">
import Fa from '../fa.vue'
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  components: {
    Fa,
  },
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    pages: {
      type: Number,
      required: true
    },
  },
  emits: {
    ['update:modelValue'](value: Number) { return true },
  },
  setup(props, { emit }) {
    const page = computed({
      get(): number {
        return props.modelValue
      },
      set(p: number) {
        emit('update:modelValue', p)
      }
    })

    return {
      page,
      faCaretLeft,
      faCaretRight,
    }
  },
})
</script>
