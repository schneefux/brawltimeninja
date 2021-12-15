<template>
  <b-card
    title="Error!"
    class="w-full"
  >
    <p slot="content" class="mb-2 prose text-gray-200">
      Something went wrong. The data you requested is not available right now.
      <br v-if="error != ''">
      {{ error }}
    </p>
  </b-card>
</template>

<script lang="ts">
import { defineComponent } from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    error: {
      type: [String, Error],
      default: ''
    },
  },
})
</script>
