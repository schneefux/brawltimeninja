<template>
  <card
    :loading="$fetchState.pending"
    :title="$t('best.players.long')"
    xxl
  >
    <horizontal-scroller
      slot="content"
      expand-on-desktop
    >
      <div
        v-if="$fetchState.pending"
        class="w-full"
        style="height: 68px;"
      ></div>

      <card
        v-for="player in data"
        :key="player.tag"
        :title="player.name"
        :link="localePath(`/profile/${player.tag}`)"
        :icon="`/avatars/${player.icon}`"
        :icon-alt="player.name"
        size="w-40"
        elevation="2"
        class="flex-shrink-0 whitespace-nowrap"
        itemscope
        itemtype="http://schema.org/Person"
        dense
      >
        <p
          slot="content"
          class="text-sm text-center"
        >
          {{ player.metric }}
          {{ metricName }}
        </p>
      </card>
    </horizontal-scroller>

    <b-button
      slot="actions"
      :to="localePath(`/leaderboard/${metric}`)"
      primary
      prefetch
      sm
    >
      {{ $t('action.open.leaderboard.metric', { metric: $t('metric.' + metric) }) }}
    </b-button>
  </card>
</template>

<script lang="ts">
import Vue from 'vue'
import { commonMeasurements } from '~/lib/cube'
import { capitalize } from '~/lib/util'
import { Leaderboard } from '~/model/Api'

interface Row {
  tag: string
  name: string
  icon: number
  metric: string
}

export default Vue.extend({
  props: {
    metric: {
      type: String,
      default: 'trophies'
    },
    limit: {
      type: Number,
      default: 4
    },
  },
  data() {
    return {
      data: [] as Row[],
    }
  },
  fetchDelay: 0,
  watch: {
    metric: '$fetch',
    limit: '$fetch',
  },
  async fetch() {
    const leaderboard = await this.$axios.$get<Leaderboard>('/api/leaderboard/' + this.metric)
    this.data = leaderboard.entries
      .slice(0, this.limit)
      .map(e => (<Row>{
        tag: e.tag,
        name: e.name,
        icon: e.icon,
        metric: this.$clicker.format(commonMeasurements[this.metric], e.metric),
      }))
  },
  computed: {
    metricName(): string {
      return capitalize(commonMeasurements[this.metric].name)
    },
  },
})
</script>
