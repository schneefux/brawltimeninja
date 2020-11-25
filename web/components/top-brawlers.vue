<template>
  <div class="flex flex-wrap justify-center">
    <div
      v-for="brawler in data"
      :key="brawler.brawler_name"
      class="card-wrapper px-2"
      itemscope
      itemtype="http://schema.org/Person"
    >
      <router-link
        class="block card card--dark prop-card md:prop-card-lg"
        :to="`/tier-list/brawler/${brawler.id}`"
      >
        <span class="prop-card-title md:prop-card-title-lg" itemprop="name">
          {{ brawler.brawler_name }}
        </span>
        <media-img
          :path="'/brawlers/' + brawler.id + '/avatar'"
          :alt="brawler.brawler_name"
          size="160"
          clazz="prop-card-image md:prop-card-image-lg"
          itemprop="image"
        ></media-img>
        <div
          class="prop-card__content"
          itemscope
          itemtype="http://schema.org/QuantitativeValue"
        >
          <span class="card-prop-value" itemprop="value">
            {{ metaStatMaps.formatters.winRate(brawler.battle_victory) }}
          </span>
          <span class="text-xs md:text-sm" itemprop="unitText">
            {{ metaStatMaps.labels.winRate }}
          </span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { brawlerId, capitalizeWords, metaStatMaps } from '~/lib/util'
import { BrawlerMetaStatistics } from '~/model/Api'

interface Row {
  id: string
  brawler_name: string
  battle_victory: number
}

export default Vue.extend({
  data() {
    return {
      data: [] as Row[],
    }
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('meta.brawler.widget', 'map',
      ['brawler_name'],
      ['battle_victory'],
      {
        ...this.$clicker.defaultSlices('map'),
        trophy_season_end: ['current'],
      },
      {
        sort: { wins_zscore: 'desc' },
        limit: 4,
        cache: 60*60,
      })
    data.data.forEach(r => {
      r.brawler_name = capitalizeWords(r.brawler_name.toLowerCase())
      r.id = brawlerId({ name: r.brawler_name })
    })
    this.data = data.data as any
  },
  computed: {
    metaStatMaps() {
      return metaStatMaps
    },
  },
})
</script>
