<template functional>
  <main
    v-bind="data.attrs"
    :class="['p-4', data.class, data.staticClass]"
    :style="data.staticStyle"
  >
    <h1
      v-if="props.title != ''"
      class="text-3xl font-semibold"
    >{{ props.title }}</h1>

    <slot></slot>
  </main>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export default Vue.extend({
  functional: true,
  props: {
    title: {
      type: String,
      default: ''
    },
  },
})
</script>
