<template>
  <event-card :mode="mode">
    <template v-slot:content>
      <brawler-kv-card
        :brawler-metadata="brawlerMetadata"
        :slices="slices"
      ></brawler-kv-card>
    </template>
  </event-card>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { computed, defineComponent } from 'vue'
import { BrawlerMetadata } from '~/composables/dimension-values';

export default defineComponent({
  props: {
    brawlerMetadata: {
      type: Object as PropType<BrawlerMetadata>,
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
