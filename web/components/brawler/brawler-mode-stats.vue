<template>
  <event-card :mode="mode">
    <div
      slot="content"
      class="h-full flex flex-col justify-center"
    >
      <brawler-kv-card
        :brawler-name="brawlerName"
        :slices="slices"
      ></brawler-kv-card>
    </div>
  </event-card>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'

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
