<template>
  <section :aria-labelledby="title != undefined ? id : undefined">
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

    <LazyHydrationWrapper
      v-if="lazy"
      when-visible
      when-idle
    >
      <div
        :class="{
          'mt-4': title != undefined,
          'mt-8': title == undefined,
        }"
      >
        <slot></slot>
      </div>
    </LazyHydrationWrapper>

    <div
      v-else
      :class="{
        'mt-4': title != undefined,
        'mt-8': title == undefined,
      }"
    >
      <slot></slot>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useUniqueId } from '../../composables/id'
import { LazyHydrationWrapper } from 'vue3-lazy-hydration'

export default defineComponent({
  components: {
    LazyHydrationWrapper,
  },
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

    return {
      id,
    }
  },
})
</script>
