<template functional>
  <div class="flex justify-between bg-gray-800">
    <router-link
      v-for="brawler in props.brawlers"
      :key="brawler"
      :to="`/tier-list/brawler/${props.brawlerId({ name: brawler })}`"
      class="flex-1"
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
