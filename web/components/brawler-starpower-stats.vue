<template>
  <div class="flex flex-wrap justify-around">
    <card
      v-for="entry in data"
      :key="entry.id"
      :title="formatKind + ': ' + formatName(entry)"
      :icon="`/${kind}/${entry.id}`"
      :icon-alt="`${brawlerName}'s ${formatKind} ${formatName(entry)}`"
      full-height
      md
    >
      <dl slot="content">
        <p
          v-if="descriptions != null"
          class="mb-3 h-full"
        >
          <q class="italic">{{ gameFileDescription(entry) }}</q>
          <template v-if="contentDescription(entry) != ''">
            <br>
            {{ contentDescription(entry) }}
          </template>
          <template v-if="metaDescription(entry) != ''">
            <br>
            {{ metaDescription(entry) }}
          </template>
        </p>
        <div class="flex justify-between">
          <dt class="font-semibold">No {{ formatKind }} Win Rate</dt>
          <dd>{{ metaStatMaps.formatters.winRate(totals.battle_victory) }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="font-semibold">{{ formatName(entry) }} Win Rate</dt>
          <dd>{{ metaStatMaps.formatters.winRate(entry.battle_victory) }}</dd>
        </div>
      </dl>
    </card>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { metaStatMaps, capitalize, scaleInto } from '~/lib/util'
import { BrawlerContent } from '~/model/Web'
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
      content: null as BrawlerContent|null,
      data: [] as Row[],
      totals: null as Row|null,
      descriptions: null as Record<string, string>|null,
    }
  },
  fetchDelay: 0,
  async fetch() {
    this.content = await this.$content(`/brawlers/${this.brawlerId}`).fetch().catch(err => null) as BrawlerContent|null

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
    formatKind(): string {
      return this.kind == 'gadgets' ? 'Gadget' : 'Star Power'
    },
    // TODO turn concrete gadgets into subcomponent to avoid these loops
    getName() {
      return (entry: Row) => this.kind == 'gadgets' ? entry.brawler_gadget_name : entry.brawler_starpower_name
    },
    formatName() {
      return (entry: Row) => capitalize(this.getName(entry)?.toLowerCase() || '')
    },
    gameFileDescription() {
      return (entry: Row) => {
        if (this.descriptions == undefined || this.getName(entry) == undefined) {
          return ''
        }
        return this.descriptions[this.getName(entry)!]
      }
    },
    metaDescription() {
      return (entry: Row) => {
        if (this.data.length == 0 || this.totals == undefined) {
          return ''
        }

        const diff = entry.battle_victory - this.totals.battle_victory
        const differenceTexts = ['has no noticable impact', 'provides a small advantage', 'provides a noticable advantage', 'improves the chances of winning a lot']
        const differenceText = differenceTexts[scaleInto(0, 0.05, differenceTexts.length - 1, diff)]

        return `Looking at the Win Rates, ${this.formatName(entry)} ${differenceText}.`
      }
    },
    contentDescription() {
      return (entry: Row) => {
        if (this.content == null) {
          return ''
        }

        const map = {} as Record<string, string>
        if (this.content.starpowers != undefined) {
          this.content.starpowers.forEach(sp => map[sp.name] = sp.description)
        }
        if (this.content.gadgets != undefined) {
          this.content.gadgets.forEach(g => map[g.name] = g.description)
        }

        return map[this.formatName(entry)] || ''
      }
    },
  },
})
</script>
