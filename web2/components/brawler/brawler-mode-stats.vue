<template>
  <event-card :mode="mode">
    <brawler-kv-card
      slot="content"
      :brawler-name="brawlerName"
      :slices="slices"
    ></brawler-kv-card>
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
