<template functional>
  <card :pages="props.pages" size="">
    <template v-slot:content="{open, page}">
      <div class="card__content">
        <h3 class="card__header">
          {{ props.title }}
        </h3>

        <p class="card__text">
          {{ props.description }}
        </p>

        <div class="mt-2">
          <slot :open="open" :page="page"></slot>
        </div>
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
