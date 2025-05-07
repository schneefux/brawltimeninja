<template>
  <div class="relative">
    <div
      :class="{
        [size]: !expanded,
        'overflow-hidden fade-out': !expanded,
      }"
      @click="handleClick"
    >
      <slot></slot>
    </div>
    <b-button
      v-if="!expanded"
      class="absolute bottom-2 left-1/2 -translate-x-1/2"
      primary
      md
      @click="handleClick"
    >
      {{ $t('action.expand') }}
    </b-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  emits: {
    expand: null
  },
  props: {
    static: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'h-64',
    },
  },
  setup(props, { emit }) {
    const expanded = ref(false)

    const handleClick = () => {
      if (!props.static) {
        expanded.value = true
      }
      emit('expand')
    }

    return {
      expanded,
      handleClick,
    }
  },
})
</script>

<style scoped>
.fade-out {
  mask-image: linear-gradient(180deg, #000 60%, transparent);
  -webkit-mask-image: linear-gradient(180deg, #000 60%, transparent);
}
</style>
