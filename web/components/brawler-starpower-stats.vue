<template>
  <div class="flex flex-wrap justify-around">
    <div
      v-for="entry in data"
      :key="entry.id"
      class="card card--dark card--sm card__content flex items-center"
    >
      <media-img
        :path="`/${kind}/${entry.id}`"
        clazz="w-20 pr-6"
        size="140"
      ></media-img>
      <dl class="w-full flex flex-col h-full">
        <dt class="card__header">
          {{ kind == 'gadgets' ? 'Gadget' : 'Star Power' }}: {{ capitalize(getName(entry).toLowerCase()) }}
        </dt>
        <dd
          v-if="descriptions != null"
          class="card__text mb-3 h-full"
        >
          {{ descriptions[getName(entry)] }}<br>
          {{ description(entry) }}
        </dd>
        <div class="flex justify-between">
          <dt class="font-semibold">No {{ kind == 'gadgets' ? 'Gadget' : 'Star Power' }} Win Rate</dt>
          <dd>{{ metaStatMaps.formatters.winRate(totals.battle_victory) }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="font-semibold">{{ capitalize(getName(entry).toLowerCase()) }} Win Rate</dt>
          <dd>{{ metaStatMaps.formatters.winRate(entry.battle_victory) }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { metaStatMaps, capitalize, scaleInto } from '~/lib/util'
import { BrawlerStatisticsRows } from '../model/Clicker'
import { BrawlerData } from '../model/Media'

interface Row {
  brawler_starpower_id?: number
  brawler_starpower_name?: string
  brawler_gadget_id?: number
  brawler_gadget_name?: string
  battle_victory: number

  id?: number
}

export default Vue.extend({
  props: {
    brawlerId: {
      type: String,
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
    kind: {
      type: String, // 'starpowers', 'gadgets'
      required: true
    },
  },
  data() {
    return {
      data: [] as Row[],
      totals: null as Row|null,
      descriptions: null as Record<string, string>|null,
    }
  },
  fetchDelay: 0,
  async fetch() {
    const dimensions = this.kind == 'starpowers' ? ['brawler_starpower_id', 'brawler_starpower_name'] : ['brawler_gadget_id', 'brawler_gadget_name']
    const cube = this.kind == 'starpowers' ? 'starpower' : 'gadget'

    // TODO queries could be combined
    const dataWith = await this.$clicker.query('meta.starpower.brawler-widget', cube,
      dimensions,
      ['battle_victory'],
      {
        ...this.$clicker.defaultSlices('starpower'),
        brawler_name: [this.brawlerName.toUpperCase()], // TODO use the ID
        [this.kind == 'starpowers' ? 'with_starpower' : 'with_gadget']: ['true'],
      },
      { sort: { timestamp: 'desc' }, cache: 60*60 })

    const dataWithout = await this.$clicker.query('meta.starpower.brawler-widget', cube,
      dimensions,
      ['battle_victory'],
      {
        ...this.$clicker.defaultSlices('starpower'),
        brawler_name: [this.brawlerName.toUpperCase()], // TODO use the ID
        [this.kind == 'starpowers' ? 'with_starpower' : 'with_gadget']: ['false'],
      },
      { sort: { timestamp: 'desc' }, cache: 60*60 })

    this.data = (dataWith.data as unknown as Row[]).map(r => ({
      ...r,
      id: this.kind == 'starpowers' ? r.brawler_starpower_id : r.brawler_gadget_id,
    }))
      // in case of duplicate IDs, use the first (most recent)
      .filter((el, index, all) => all.findIndex(e => e.id == el.id) == index)

    this.totals = dataWithout.data[0]

    const info = await this.$axios.$get(`${process.env.mediaUrl}/brawlers/${this.brawlerId}/info`).catch(() => null) as BrawlerData|null
    if (info != null) {
      if (this.kind == 'starpowers') {
        this.descriptions = info.starpowerDescriptions
      } else {
        this.descriptions = info.gadgetDescriptions
      }
    }
  },
  computed: {
    capitalize() {
      return capitalize
    },
    metaStatMaps() {
      return metaStatMaps
    },
    getName() {
      return (entry: Row) => this.kind == 'gadgets' ? entry.brawler_gadget_name : entry.brawler_starpower_name
    },
    description() {
      return (entry: Row) => {
        if (this.data.length == 0 || this.totals == undefined) {
          return ''
        }

        const diff = entry.battle_victory - this.totals.battle_victory
        const differenceTexts = ['has no noticable impact on the win rate', 'provides a small advantage', 'provides a noticable advantage', 'improves the chances of winning a lot']
        const differenceText = differenceTexts[scaleInto(0, 0.05, differenceTexts.length - 1, diff)]

        return `${capitalize(this.getName(entry)?.toLowerCase() || '')} ${differenceText}.`
      }
    },
  },
})
</script>
