<template>
  <b-card
    :loading="$fetchState.pending"
    :title="$t('best.players.long')"
    full-height
  >
    <b-horizontal-scroller
      slot="content"
      expand-on-desktop
      class="gap-x-4"
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
        :icon="`/avatars/${player.icon}`"
        :icon-alt="player.name"
        :elevation="2"
        size="w-40"
        class="shrink-0 whitespace-nowrap"
        itemscope
        itemtype="http://schema.org/Person"
        dense
      >
        <template v-slot:icon="data">
          <media-img-icon v-bind="data"></media-img-icon>
        </template>

        <p
          slot="content"
          class="text-sm text-center"
        >
          {{ player.metric }}
          {{ $t('metric.trophies') }}
        </p>
      </b-card>
    </b-horizontal-scroller>

    <b-button
      slot="actions"
      :to="localePath(`/leaderboard/trophies`)"
      primary
      prefetch
      sm
    >
      {{ $t('action.open.leaderboard.metric', { metric: $t('metric.trophies') }) }}
    </b-button>
  </b-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { trophiesMetric } from '~/lib/klicker.conf'
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
    limit: {
      type: Number,
      default: 3
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
    const leaderboard = await this.$http.$get<Leaderboard>(this.$config.apiUrl + '/api/leaderboard/trophies')
    this.data = leaderboard.entries
      .slice(0, this.limit)
      .map(e => (<Row>{
        tag: e.tag,
        name: e.name,
        icon: e.icon,
        metric: this.$klicker.format(trophiesMetric, e.metric),
      }))
  },
})
</script>
