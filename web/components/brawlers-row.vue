<template>
  <shimmer
    :loading="loading"
    class="flex justify-between w-72"
  >
    <router-link
      v-for="brawler in brawlers"
      :to="localePath(`/tier-list/brawler/${brawlerId({ name: brawler.brawler_name })}`)"
      :key="brawler.brawler_name"
      class="flex-1 flex flex-col justify-end items-center mx-px"
    >
      <media-img
        :path="`/brawlers/${brawlerId({ name: brawler.brawler_name })}/avatar`"
        :alt="capitalizeWords(brawler.brawler_name.toLowerCase())"
        size="160"
        clazz="h-10"
      ></media-img>
      <p class="text-xs tracking-tighter">
        <slot :brawler="brawler"></slot>
      </p>
    </router-link>
    <p v-if="!loading && brawlers.length == 0">
      {{ $t('state.no-data') }}
    </p>
  </shimmer>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { brawlerId, capitalizeWords } from '~/lib/util'

interface Row {
  brawler_name: string
}

export default Vue.extend({
  props: {
    brawlers: {
      type: Array as PropType<Row[]>,
      required: true
    },
    loading: {
      type: Boolean
    },
  },
  computed: {
    brawlerId() {
      return brawlerId
    },
    capitalizeWords() {
      return capitalizeWords
    },
  },
})
</script>
