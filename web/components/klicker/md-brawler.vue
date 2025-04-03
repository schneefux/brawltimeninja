<template>
  <a
    :href="href"
    :title="title"
    @click.stop
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
          clazz="w-8 absolute top-0 right-0 bg-gray-900/75 rounded-full p-1 object-contain object-top-right"
          loading="lazy"
        ></media-img>
        <media-img
          v-if="starpowerId != undefined"
          :path="`/starpowers/${starpowerId}`"
          :alt="starpowerName"
          size="80"
          clazz="w-8 absolute top-0 right-0 bg-gray-900/75 rounded-full p-1 object-contain object-top-right"
          loading="lazy"
        ></media-img>
        <media-img
          v-if="gadgetId != undefined"
          :path="`/gadgets/${gadgetId}`"
          :alt="gadgetName"
          size="80"
          clazz="w-8 absolute top-0 right-0 bg-gray-900/75 rounded-full p-1 object-contain object-top-right"
          loading="lazy"
        ></media-img>
      </span>
      <figcaption
        v-if="captioned"
        class="ml-2 leading-none"
      >{{ brawlerAllyName || starpowerName || gadgetName || brawlerBrawlerName }}</figcaption>
    </figure>
  </a>
</template>

<script lang="ts">
import { useLocalePath } from '~/composables/compat'
import { defineComponent, computed, PropType } from 'vue'
import { MetaGridEntry } from '@schneefux/klicker/types'
import { brawlerId, capitalizeWords } from '~/lib/util'
import { useLink } from 'vue-router'

export default defineComponent({
  props: {
    row: {
      type: Object as PropType<MetaGridEntry>,
      required: true
    },
    captioned: {
      type: Boolean,
    },
  },
  setup(props) {
    const localePath = useLocalePath()

    // for dimension rendering: swap brawler and ally/enemy so that the ally/enemy will be large
    const brawler = computed(() => {
      if (props.row.metricsRaw.brawler != undefined) {
        return props.row.metricsRaw.brawler as string
      }
      if (props.row.dimensionsRaw.enemy != undefined) {
        return props.row.dimensionsRaw.enemy.enemy
      }
      if (props.row.dimensionsRaw.ally != undefined) {
        return props.row.dimensionsRaw.ally.ally
      }
      if (props.row.dimensionsRaw.brawler != undefined) {
        return props.row.dimensionsRaw.brawler.brawler
      }
      if (props.row.dimensionsRaw.starpower != undefined) {
        return props.row.dimensionsRaw.starpower.brawler
      }
      if (props.row.dimensionsRaw.gadget != undefined) {
        return props.row.dimensionsRaw.gadget.brawler
      }
      return ''
    })

    const ally = computed(() => {
      if (props.row.dimensionsRaw.ally != undefined || props.row.dimensionsRaw.enemy != undefined) {
        return props.row.dimensionsRaw.brawler.brawler
      }
      return undefined
    })

    const brawlerBrawlerId = computed(() => brawlerId({ name: brawler.value }))
    const brawlerBrawlerName = computed(() => capitalizeWords(brawler.value.toLowerCase()))
    const brawlerAllyId = computed(() => ally.value != undefined ? brawlerId({ name: ally.value }) : undefined)
    const brawlerAllyName = computed(() => ally.value != undefined ? capitalizeWords(ally.value.toLowerCase()) : undefined)
    const link = computed(() => localePath(`/tier-list/brawler/${brawlerBrawlerId.value}`))
    const title = computed(() => props.row.dimensions.starpower || props.row.dimensions.gadget || capitalizeWords(brawler.value.toLowerCase()))
    const starpowerName = computed(() => props.row.dimensions.starpower)
    const starpowerId = computed(() => props.row.dimensionsRaw.starpower?.starpower)
    const gadgetName = computed(() => props.row.dimensions.gadget)
    const gadgetId = computed(() => props.row.dimensionsRaw.gadget?.gadget)

    // render <a> directly to improve performance
    const { href } = useLink({ to: link })

    return {
      href,
      title,
      brawler,
      ally,
      starpowerName,
      starpowerId,
      gadgetName,
      gadgetId,
      brawlerAllyId,
      brawlerAllyName,
      brawlerBrawlerId,
      brawlerBrawlerName,
    }
  },
})
</script>
