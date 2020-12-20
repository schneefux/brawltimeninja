<template functional>
  <div
    :style="data.staticStyle"
    :class="['relative', props.height, data.class, data.staticClass]"
  >
    <router-link
      v-for="(brawler, index) in props.brawlers"
      :key="brawler + '-' + index"
      :to="`/tier-list/brawler/${props.brawlerId({ name: brawler })}`"
      class="absolute top-0"
      :style="{
        // 50% - avg. width - position
        left: `calc(50% - 20px - (${(index - (props.brawlers.length - 1) / 2) * 100 / (props.brawlers.length + 1)}%))`,
      }"
    >
      <media-img
        :path="`/brawlers/${props.brawlerId({ name: brawler})}/avatar`"
        :alt="props.capitalizeWords(brawler.toLowerCase())"
        size="160"
        :clazz="props.height"
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
    height: {
      type: String,
      default: 'h-8'
    },
  },
})
</script>
