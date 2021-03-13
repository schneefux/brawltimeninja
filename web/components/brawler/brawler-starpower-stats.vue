<template>
  <div class="flex flex-wrap justify-around">
    <brawler-starpower-card
      v-for="entry in data"
      :key="entry.id"
      :id="entry.id"
      :kind="kind"
      :name="getStrings(entry).name"
      :brawler-name="brawlerName"
      :description="getStrings(entry).description"
      :winRate="entry.battle_victory"
      :without-winRate="totals.battle_victory"
    ></brawler-starpower-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BrawlerData } from '@/model/Media'

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
      descriptions: null as Record<string, { name: string, description: string}>|null,
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
        ...this.$clicker.defaultSlicesRaw('starpower'),
        brawler_name: [this.brawlerName.toUpperCase()], // TODO use the ID
        [this.kind == 'starpowers' ? 'with_starpower' : 'with_gadget']: ['true'],
      },
      { sort: { timestamp: 'desc' }, cache: 60*60 })

    const dataWithout = await this.$clicker.query('meta.starpower.brawler-widget', cube,
      dimensions,
      ['battle_victory'],
      {
        ...this.$clicker.defaultSlicesRaw('starpower'),
        brawler_name: [this.brawlerName.toUpperCase()], // TODO use the ID
        [this.kind == 'starpowers' ? 'with_starpower' : 'with_gadget']: ['false'],
      },
      { sort: { timestamp: 'desc' }, cache: 60*60 })

    this.data = (dataWith.data as unknown as Row[]).map(r => ({
      ...r,
      id: this.kind == 'gadgets' ? r.brawler_gadget_id : r.brawler_starpower_id,
    }))
      // in case of duplicate IDs, use the first (most recent)
      .filter((el, index, all) => all.findIndex(e => e.id == el.id) == index)

    this.totals = dataWithout.data[0]

    const info = await this.$axios.$get<BrawlerData>(`${this.$config.mediaUrl}/brawlers/${this.brawlerId}/${this.$i18n.locale}.json`).catch(() => null) as BrawlerData|null
    if (info != null) {
      if (this.kind == 'starpowers') {
        this.descriptions = info.starpowerDescriptions
      } else {
        this.descriptions = info.gadgetDescriptions
      }
    }
  },
  computed: {
    getId(): (entry: Row) => number|undefined {
      return (entry: Row) => this.kind == 'gadgets' ? entry.brawler_gadget_id : entry.brawler_starpower_id
    },
    getStrings(): (entry: Row) => { name?: string, description?: string } {
      return (entry: Row) => {
        const id = this.getId(entry)
        return this.descriptions == null || id == undefined || !(id in this.descriptions) ? {} : this.descriptions[id]
      }
    },
  },
})
</script>
