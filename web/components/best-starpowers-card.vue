<template>
  <card
    :title="title"
    size="w-64"
    scopedSlots={slots}
  >
    <div slot="actions" class="flex justify-end">
      <nuxt-link
        :to="`/tier-list/${kind}`"
        class="button button--md"
      >
        Open
      </nuxt-link>
    </div>

    <div slot="content" class="brawler-avatars">
      <div v-if="$fetchState.pending" class="brawler-avatars__placeholder" style="height: 87px"></div>
      <div
        v-for="entry in topStarpowers"
        :key="entry.id"
        :style="`width: ${100 / Object.keys(topStarpowers).length}%`"
        class="brawler-avatars__element my-4"
      >
        <div class="brawler-avatar">
          <media-img
            :path="`/${kind}/${entry.id}`"
            size="160"
            clazz="brawler-avatar__img mx-auto"
          />
          <p class="brawler-avatar__stats">
            {{ metaStatMaps.formatters.winRate(entry.battle_victory) }}
            &nbsp;
            {{ metaStatMaps.labelsShort.winRate }}
          </p>
        </div>
      </div>
    </div>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { metaStatMaps, capitalize } from '../lib/util'

interface Row {
  brawler_id: number
  brawler_name: string
  brawler_starpower_id?: number
  brawler_starpower_name?: string
  brawler_gadget_id?: number
  brawler_gadget_name?: string
  battle_victory: number

  id?: number
}

export default Vue.extend({
  props: {
    kind: {
      type: String as PropType<'starpowers'|'gadgets'>,
      default: 'starpowers'
    },
  },
  data() {
    return {
      topStarpowers: [] as Row[],
    }
  },
  async fetch() {
    const cube = this.kind == 'starpowers' ? 'starpower' : 'gadget'
    const dimensions = this.kind == 'starpowers' ? ['brawler_starpower_id', 'brawler_starpower_name'] : ['brawler_gadget_id', 'brawler_gadget_name']
    const data = await this.$clicker.query('meta.starpower.widget', cube,
      ['brawler_id', 'brawler_name', ...dimensions],
      ['battle_victory'],
      {
        [this.kind == 'starpowers' ? 'with_starpower' : 'with_gadget']: ['true'],
        'trophy_season_end': ['balance'],
      },
      { sort: { picks: 'desc' }, limit: 3, cache: 60*60 })
    this.topStarpowers = data.data.map(e => (<Row>{
      ...e,
      id: this.kind == 'starpowers' ? e.brawler_starpower_id : e.brawler_gadget_id,
    }))
  },
  computed: {
    title(): string {
      return `Best ${capitalize(this.kind)}`
    },
    metaStatMaps() {
      return metaStatMaps
    },
  },
})
</script>
