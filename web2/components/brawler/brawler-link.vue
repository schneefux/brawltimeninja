<template>
  <router-link
    :to="link"
    :title="title"
    @click.native.stop
  >
    <figure class="inline-flex items-center">
      <span
        :class="['relative shrink-0', {
          'pr-3 md:pr-4': ally != undefined || starpowerId != undefined || gadgetId != undefined,
        }]"
      >
        <media-img
          :path="`/brawlers/${brawlerBrawlerId}/avatar`"
          :alt="brawlerBrawlerName"
          size="160"
          clazz="h-8 w-8 object-contain object-left"
          loading="lazy"
        ></media-img>
        <media-img
          v-if="ally != undefined"
          :path="`/brawlers/${brawlerAllyId}/avatar`"
          :alt="brawlerAllyName"
          size="80"
          clazz="w-8 absolute top-0 right-0 bg-gray-900 bg-opacity-75 rounded-full p-1 object-contain object-top-right"
          loading="lazy"
        ></media-img>
        <media-img
          v-if="starpowerId != undefined"
          :path="`/starpowers/${starpowerId}`"
          :alt="starpowerName"
          size="80"
          clazz="w-8 absolute top-0 right-0 bg-gray-900 bg-opacity-75 rounded-full p-1 object-contain object-top-right"
          loading="lazy"
        ></media-img>
        <media-img
          v-if="gadgetId != undefined"
          :path="`/gadgets/${gadgetId}`"
          :alt="gadgetName"
          size="80"
          clazz="w-8 absolute top-0 right-0 bg-gray-900 bg-opacity-75 rounded-full p-1 object-contain object-top-right"
          loading="lazy"
        ></media-img>
      </span>
      <figcaption
        v-if="captioned"
        class="ml-2 leading-none"
      >{{ brawlerAllyName || starpowerName || gadgetName || brawlerBrawlerName }}</figcaption>
    </figure>
  </router-link>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { brawlerId, capitalizeWords } from '~/lib/util'
import { useContext } from '@/composables/compat'

export default defineComponent({
  props: {
    brawler: {
      type: String,
      required: true
    },
    ally: {
      type: String,
    },
    starpowerName: {
      type: String,
    },
    starpowerId: {
      type: String,
    },
    gadgetName: {
      type: String,
    },
    gadgetId: {
      type: String,
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
  setup(props) {
    const { localePath } = useContext()
    const brawlerBrawlerId = computed(() => brawlerId({ name: props.brawler }))
    const brawlerBrawlerName = computed(() => capitalizeWords(props.brawler.toLowerCase()))
    const brawlerAllyId = computed(() => props.ally != undefined ? brawlerId({ name: props.ally }) : undefined)
    const brawlerAllyName = computed(() => props.ally != undefined ? capitalizeWords(props.ally.toLowerCase()) : undefined)
    const link = computed(() => localePath(`/tier-list/brawler/${brawlerBrawlerId.value}`))
    const title = computed(() => props.starpowerName || props.gadgetName || capitalizeWords(props.brawler.toLowerCase()))

    return {
      link,
      title,
      brawlerAllyId,
      brawlerAllyName,
      brawlerBrawlerId,
      brawlerBrawlerName,
    }
  },
})
</script>
