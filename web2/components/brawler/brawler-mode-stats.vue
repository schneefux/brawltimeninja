<template>
  <event-card :mode="mode">
    <template v-slot:content><brawler-kv-card
      
      :brawler-name="brawlerName"
      :slices="slices"
    ></brawler-kv-card></template>
  </event-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

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
  setup(props) {
    const slices = computed(() => ({
      mode: [props.mode],
    }))

    return {
      slices,
    }
  }
})
</script>
