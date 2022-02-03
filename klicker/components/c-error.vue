<template>
  <b-card
    title="Error!"
    class="w-full"
  >
    <p slot="content" class="mb-2">
      Something went wrong. The data you requested is not available right now.
      <br v-if="error != ''">
      Error message from server: {{ error }}
    </p>
  </b-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi'
import BCard from './ui/b-card.vue'

export default defineComponent({
  components: {
    BCard,
  },
  props: {
    error: {
      type: [String, Error],
      default: ''
    },
  },
})
</script>
