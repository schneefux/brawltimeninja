<template functional>
  <main
    v-bind="data.attrs"
    :class="['p-4', data.class, data.staticClass]"
    :style="data.staticStyle"
  >
    <div
      v-if="'content' in $scopedSlots"
      class="container mx-auto p-4"
    >
      <h1
        v-if="props.title != ''"
        class="text-3xl font-semibold"
      >{{ props.title }}</h1>

      <slot name="content"></slot>
    </div>

    <h1
      v-if="!('content' in $scopedSlots)"
      class="text-3xl font-semibold"
    >{{ props.title }}</h1>

    <slot name="dashboard"></slot>
  </main>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  functional: true,
  props: {
    title: {
      type: String,
      default: ''
    },
  },
})
</script>
