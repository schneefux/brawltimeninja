<template>
  <event-card
    :mode="mode"
    full-height
  >
    <div
      slot="content"
      class="h-full flex flex-col justify-center"
    >
      <brawler-kv-card
        :brawler-name="brawlerName"
        :slices="{
          mode: [mode],
        }"
      ></brawler-kv-card>
    </div>
  </event-card>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    brawlerName: {
      type: String,
      required: true
    },
    mode: {
      // camel case
      type: String,
      required: true
    },
  },
})
</script>
