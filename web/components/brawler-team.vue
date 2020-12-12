<template functional>
  <div class="h-full relative">
    <router-link
      v-for="(brawler, index) in props.brawlers"
      :key="brawler"
      :to="`/tier-list/brawler/${props.brawlerId({ name: brawler })}`"
      class="absolute top-0"
      :style="{
        // 50% - avg. width - position
        left: `calc(50% - 20px - (${(index - (props.brawlers.length - 1) / 2)  * 1.5}rem))`,
      }"
    >
      <media-img
        :path="`/brawlers/${props.brawlerId({ name: brawler})}/avatar`"
        :alt="props.capitalizeWords(brawler.toLowerCase())"
        size="160"
        clazz="h-8"
      ></media-img>
    </router-link>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { brawlerId, capitalizeWords } from '~/lib/util'

export default Vue.extend({
  functional: true,
  props: {
    brawlers: {
      type: Array as PropType<string[]>,
      required: true
    },
    brawlerId: {
      type: Function,
      default: brawlerId
    },
    capitalizeWords: {
      type: Function,
      default: capitalizeWords
    },
  },
})
</script>
