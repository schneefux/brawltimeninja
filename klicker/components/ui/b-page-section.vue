<template>
  <section :aria-labelledby="title != undefined ? id : undefined">
    <div
      v-if="title != undefined"
      class="mt-16"
    >
      <h1
        :id="id"
        class="text-2xl"
      >
        {{ title }}
      </h1>
      <slot name="description"></slot>
    </div>

    <div
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
import { defineComponent, useId } from 'vue'

export default defineComponent({
  props: {
    title: {
      type: String,
      required: false
    },
  },
  setup() {
    const id = useId()

    return {
      id,
    }
  },
})
</script>
