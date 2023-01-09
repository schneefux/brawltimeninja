<template>
  <section
    :aria-labelledby="title != undefined ? id : undefined"
  >
    <div
      v-if="title != undefined"
      class="mt-16"
    >
      <h1
        class="text-2xl"
        :id="id"
      >
        {{ title }}
      </h1>
      <slot name="description"></slot>
    </div>

    <div
      ref="wrapper"
      :class="{
        'mt-4': title != undefined,
        'mt-8': title == undefined,
      }"
    >
      <slot v-if="hydrated"></slot>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useUniqueId } from '../../composables/id'
import { useLazyHydration } from '../../composables/lazy-hydration'

export default defineComponent({
  props: {
    title: {
      type: String,
      required: false
    },
    lazy: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const { id } = useUniqueId()
    const { wrapper, hydrated } = useLazyHydration(props.lazy)

    return {
      id,
      wrapper,
      hydrated,
    }
  },
})
</script>
