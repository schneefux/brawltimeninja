<template>
  <section
    ref="section"
    v-bind-once="title != undefined ? { 'aria-labelledby': id } : {}"
  >
    <div
      v-if="title != undefined"
      class="mt-16"
    >
      <h1
        class="text-2xl"
        v-bind-once="{ id }"
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
import { generateId, BindOnce } from '../../directives/bind-once'

export default defineComponent({
  components: {
    LazyHydration,
  },
  directives: {
    BindOnce,
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
    const id = generateId()

    return {
      id,
      section,
    }
  },
})
</script>
