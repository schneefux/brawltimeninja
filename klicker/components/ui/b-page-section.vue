<template>
  <div>
    <div
      v-if="title != undefined"
      class="mt-16"
    >
      <h2 class="text-2xl">
        {{ title }}
      </h2>
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
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi'

export default defineComponent({
  props: {
    title: {
      type: String
    },
  },
})
</script>
