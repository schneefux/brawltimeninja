<template>
  <div class="flex flex-row-reverse justify-center">
    <router-link
      v-for="(brawler, index) in brawlers"
      :key="brawler + '-' + index"
      :to="`/tier-list/brawler/${brawlerId({ name: brawler })}`"
      :class="[height, width, {
        [snug]: index < brawlers.length - 1,
      }]"
      @click.native.stop
    >
      <media-img
        :path="`/brawlers/${brawlerId({ name: brawler })}/avatar`"
        :alt="capitalizeWords(brawler.toLowerCase())"
        :clazz="'bg-gray-800 border-gray-800 border-2 rounded-full object-cover ' + height + ' ' + width"
        size="160"
      ></media-img>
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { brawlerId, capitalizeWords } from '~/lib/util'

export default defineComponent({
  props: {
    brawlers: {
      type: Array as PropType<string[]>,
      required: true
    },
    height: {
      type: String,
      default: 'h-8'
    },
    width: {
      type: String,
      default: 'w-8'
    },
    snug: {
      type: String,
      default: '-ml-3'
    },
  },
  setup() {
    return {
      brawlerId,
      capitalizeWords,
    }
  },
})
</script>
