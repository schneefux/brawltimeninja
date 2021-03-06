<template>
  <card
    :title="$t('leaderboard.thing', { thing: $tc('thing.' + kindKey) })"
    xxs
  >
    <b-button
      slot="actions"
      :to="localePath(`/tier-list/${kind}`)"
      primary
      prefetch
      sm
    >
      {{ $t('action.open.thing', { thing: $tc('thing.tier-list.thing', 1, { thing: $tc('thing.' + kindKey, 1) }) }) }}
    </b-button>

    <shimmer
      slot="content"
      :loading="$fetchState.pending"
      class="flex justify-around h-14"
    >
      <div
        v-for="entry in topStarpowers"
        :key="entry.id"
        class="flex-1 flex flex-col justify-end items-center"
      >
        <media-img
          :path="`/${kind}/${entry.id}`"
          size="160"
          clazz="h-10"
        ></media-img>
        <p class="text-xs">
          {{ entry.winRate }}
          {{ $t('metric.winRate.short') }}
        </p>
      </div>
    </shimmer>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { commonMeasurements } from '../lib/cube'

interface Row {
  id: number
  winRate: string
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
  fetchDelay: 0,
  async fetch() {
    const cube = this.kind == 'starpowers' ? 'starpower' : 'gadget'
    const dimensions = this.kind == 'starpowers' ? ['brawler_starpower_id', 'brawler_starpower_name'] : ['brawler_gadget_id', 'brawler_gadget_name']
    const data = await this.$clicker.query('meta.starpower.widget', cube,
      ['brawler_id', 'brawler_name', ...dimensions],
      ['battle_victory'],
      {
        ...this.$clicker.defaultSlicesRaw(this.kindKey),
        [this.kind == 'starpowers' ? 'with_starpower' : 'with_gadget']: ['true'],
      },
      { sort: { picks: 'desc' }, limit: 3, cache: 60*60 })
    this.topStarpowers = data.data.map(e => (<Row>{
      id: this.kind == 'starpowers' ? e.brawler_starpower_id : e.brawler_gadget_id,
      winRate: this.$clicker.format(commonMeasurements.winRate, e.battle_victory),
    }))
  },
  computed: {
    kindKey(): string {
      return this.kind == 'starpowers' ? 'starpower' : 'gadget'
    },
  },
})
</script>
