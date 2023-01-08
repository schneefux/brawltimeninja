<template>
  <b-card>
    <template v-slot:content><b-scrolling-list
      
      :items="changes"
      :cell-columns="2"
      :cell-rows="2"
      :render-at-least="5"
      key-id="index"
      render-placeholder
    >
      <template v-slot:item="change">
        <time class="text-sm font-normal leading-none text-text/50">{{ change.date }}</time>
        <p class="mt-2 prose dark:prose-invert text-text/75">{{ change.description }}</p>
      </template>
    </b-scrolling-list></template>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { ScrapedBrawler } from '~/model/Web'
import { BScrollingList, BCard, BButton } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BScrollingList,
    BButton,
    BCard,
  },
  props: {
    scrapedData: {
      type: Object as PropType<ScrapedBrawler>,
      required: false
    },
  },
  setup(props) {
    const changes = computed(() => props.scrapedData?.history
      .reverse()
      .map((change, index) => ({
        ...change,
        index,
      })) ?? []
    )

    return {
      changes,
    }
  },
})
</script>
