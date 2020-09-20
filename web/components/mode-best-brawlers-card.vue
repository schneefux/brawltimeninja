<template>
  <event-card
    :mode="mode"
  >
    <div slot="actions" class="flex justify-end">
      <nuxt-link
        :to="`/tier-list/mode/${camelToKebab(mode)}`"
        class="button button--md"
      >
        Open
      </nuxt-link>
    </div>

    <div slot="content" class="brawler-avatars my-4">
      <div
        v-for="brawler in data"
        :key="brawler.id"
        class="brawler-avatars__element"
      >
        <div class="brawler-avatar">
          <media-img
            :path="`/brawlers/${brawlerId({ name: brawler.brawler_name })}/avatar`"
            size="160"
            clazz="brawler-avatar__img"
          ></media-img>
          <p class="brawler-avatar__stats">
            {{ metaStatMaps.formatters.winRate(brawler.battle_victory) }}
            &nbsp;
            {{ metaStatMaps.labelsShort.winRate }}
          </p>
        </div>
      </div>
    </div>
  </event-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { camelToKebab, metaStatMaps, MetaGridEntrySorted, brawlerId } from '../lib/util'

interface Row {
  brawler_name: string
  battle_victory: number
}

export default Vue.extend({
  props: {
    mode: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      data: [] as Row[],
      totals: {} as Row,
    }
  },
  async fetch() {
    const data = await this.$clicker.query('meta.mode.widget', 'map',
      ['brawler_name'],
      ['battle_victory'],
      {
        trophy_season_end: ['balance'],
        battle_event_mode: [this.mode],
      },
      {
        sort: { battle_victory: 'desc' },
        limit: 5,
        cache: 60*60,
      })
    this.data = data.data as any
  },
  computed: {
    metaStatMaps() {
      return metaStatMaps
    },
    brawlerId() {
      return brawlerId
    },
    camelToKebab() {
      return camelToKebab
    },
  },
})
</script>
