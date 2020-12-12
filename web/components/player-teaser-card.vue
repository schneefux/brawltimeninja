<template functional>
  <card
    :pages="props.pages"
    :title="props.title"
  >
    <template v-slot:content="{ open, page }">
      <p>
        {{ props.description }}
      </p>

      <div class="mt-2">
        <slot :open="open" :page="page"></slot>
      </div>
    </template>
  </card>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    pages: {
      type: Number,
      default: 1
    },
  },
})
</script>
