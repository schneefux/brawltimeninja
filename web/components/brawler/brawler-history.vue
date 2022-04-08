<template>
  <b-card>
    <b-scrolling-list
      slot="content"
      :items="changes"
      :cell-columns="2"
      :cell-rows="2"
      :render-at-least="5"
      key-id="index"
      render-placeholder
    >
      <template v-slot:item="change">
        <time class="text-sm font-normal leading-none text-gray-800/50 dark:text-gray-200/50">{{ change.date }}</time>
        <p class="mt-2 prose dark:prose-invert text-gray-800/75 dark:text-gray-200/75">{{ change.description }}</p>
      </template>
    </b-scrolling-list>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@nuxtjs/composition-api'
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