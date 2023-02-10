<template>
  <section
    ref="section"
    :aria-labelledby="titleRef?.id"
  >
    <div
      v-if="title != undefined"
      class="mt-16"
    >
      <h1
        ref="titleRef"
        class="text-2xl"
        v-uid
      >
        {{ title }}
      </h1>
      <slot name="description"></slot>
    </div>

    <lazy-hydration
      v-if="lazy"
      :hydrate-when-visible="section"
    >
      <div
        :class="{
          'mt-4': title != undefined,
          'mt-8': title == undefined,
        }"
      >
        <slot></slot>
      </div>
    </lazy-hydration>

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
import { ref, defineComponent } from 'vue'
import LazyHydration from './lazy-hydration.vue'
import { Uid } from '../../directives/uid'

export default defineComponent({
  components: {
    LazyHydration,
  },
  directives: {
    Uid,
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
  setup() {
    const section = ref<HTMLElement>()
    const titleRef = ref<HTMLElement>()

    return {
      titleRef,
      section,
    }
  },
})
</script>
