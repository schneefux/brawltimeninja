<template>
  <portal v-if="value">
    <div class="fixed z-50 inset-0 bg-background/75 overflow-y-auto overscroll-contain">
      <div
        class="h-full flex justify-center items-center pt-20 pb-8 px-4"
        @click.self="$emit('input', false)"
      >
        <slot></slot>
      </div>

      <button
        class="absolute top-0 right-0 mr-10 mt-4 text-white text-5xl"
        aria-label="close"
        @click="$emit('input', false)"
      >
        <font-awesome-icon
          :icon="faTimes"
        ></font-awesome-icon>
      </button>
    </div>
  </portal>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { Portal } from '@linusborg/vue-simple-portal'

export default defineComponent({
  components: {
    FontAwesomeIcon,
    Portal, // TODO replace by <Teleport> in Vue 3
  },
  props: {
    value: {
      type: Boolean,
      required: true
    },
  },
  setup() {
    return {
      faTimes,
    }
  },
})
</script>
