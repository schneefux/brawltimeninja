<template>
  <b-card
    :loading="$fetchState.pending"
    :title="$t('best.players.long')"
    xxl
  >
    <b-horizontal-scroller
      slot="content"
      expand-on-desktop
    >
      <div
        v-if="$fetchState.pending"
        class="w-full"
        style="height: 68px;"
      ></div>

      <b-card
        v-for="player in data"
        :key="player.tag"
        :title="player.name"
        :link="localePath(`/profile/${player.tag}`)"
        :icon-alt="player.name"
        :elevation="2"
        size="w-40"
        class="shrink-0 whitespace-nowrap"
        itemscope
        itemtype="http://schema.org/Person"
        dense
      >
        <media-img
          slot="icon"
          :path="`/avatars/${player.icon}`"
          :alt="player.name"
          size="120"
        ></media-img>

        <p
          slot="content"
          class="text-sm text-center"
        >
          {{ player.metric }}
          {{ metricName }}
        </p>
      </b-card>
    </b-horizontal-scroller>

    <b-button
      slot="actions"
      :to="localePath(`/leaderboard/${metric}`)"
      primary
      prefetch
      sm
    >
      {{ $t('action.open.leaderboard.metric', { metric: $t('metric.' + metric) }) }}
    </b-button>
  </b-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { commonMeasurements } from '~/lib/klicker.conf'
import { capitalize } from '~/lib/util'
import { Leaderboard } from '~/model/Api'
import { BHorizontalScroller } from '@schneefux/klicker/components'

interface Row {
  tag: string
  name: string
  icon: number
  metric: string
}

export default Vue.extend({
  components: {
    BHorizontalScroller,
  },
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
    const leaderboard = await this.$http.$get<Leaderboard>(this.$config.apiUrl + '/api/leaderboard/' + this.metric)
    this.data = leaderboard.entries
      .slice(0, this.limit)
      .map(e => (<Row>{
        tag: e.tag,
        name: e.name,
        icon: e.icon,
        metric: this.$klicker.format(commonMeasurements[this.metric], e.metric),
      }))
  },
  computed: {
    metricName(): string {
      return capitalize(commonMeasurements[this.metric].name)
    },
  },
})
</script>
