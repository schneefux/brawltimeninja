<template functional>
  <router-link
    :to="parent.localePath(`/tier-list/brawler/${props.brawlerId({ name: props.brawler })}`)"
    :title="props.starpowerName || props.gadgetName || props.capitalizeWords(props.brawler.toLowerCase())"
    class="flex justify-center items-center"
  >
    <div
      :class="['relative flex-shrink-0', {
        'pr-3 md:pr-4': props.starpowerId != undefined || props.gadgetId != undefined,
      }]"
    >
      <media-img
        :path="`/brawlers/${props.brawlerId({ name: props.brawler })}/avatar`"
        :alt="props.capitalizeWords(props.brawler.toLowerCase())"
        size="160"
        clazz="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10"
      ></media-img>
      <media-img
        v-if="props.starpowerId != undefined"
        :path="`/starpowers/${props.starpowerId}`"
        :alt="props.starpowerName"
        size="80"
        clazz="w-6 sm:w-8 absolute top-0 right-0 bg-gray-900 bg-opacity-75 rounded-full p-1"
      ></media-img>
      <media-img
        v-if="props.gadgetId != undefined"
        :path="`/gadgets/${props.gadgetId}`"
        :alt="props.gadgetName"
        size="80"
        clazz="w-6 sm:w-8 absolute top-0 right-0 bg-gray-900 bg-opacity-75 rounded-full p-1"
      ></media-img>
    </div>
    <span
      v-if="props.captioned"
      class="ml-2 w-16 md:w-24"
    >{{ props.starpowerName || props.gadgetName || props.capitalizeWords(props.brawler.toLowerCase()) }}</span>
  </router-link>
</template>

<script lang="ts">
import Vue from 'vue'
import { brawlerId, capitalizeWords } from '~/lib/util'

export default Vue.extend({
  functional: true,
  props: {
    brawler: {
      type: String,
      required: true
    },
    starpowerName: {
      type: String,
    },
    starpowerId: {
      type: Number,
    },
    gadgetName: {
      type: String,
    },
    gadgetId: {
      type: Number,
    },
    captioned: {
      type: Boolean
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
