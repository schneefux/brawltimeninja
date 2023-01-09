<template>
  <b-card
    :loading="leaderboard == null"
    :title="$t('best.players.long')"
  >
    <template v-slot:content><b-scrolling-list
      v-if="leaderboard != undefined && leaderboard.length > 0"

      :items="leaderboard != undefined ? leaderboard : []"
      :cell-columns="2"
      :render-at-least="5"
      key-id="tag"
      render-placeholder
    >
      <template v-slot:item="player">
        <b-card
          :title="player.name"
          :link="localePath(`/profile/${player.tag.replace('#', '')}`)"
          :icon="`/avatars/${player.icon}`"
          :icon-alt="player.name"
          :elevation="elevation"
          class="whitespace-nowrap"
          dense
        >
          <template v-slot:icon="data">
            <media-img-icon v-bind="data"></media-img-icon>
          </template>

          <template v-slot:content><b-kv-table

            :rows="[{
              title: $t('metric.trophies'),
              key: 'trophies',
            }]"
            :data="player"
            id-key="tag"
            class="mt-2"
          ></b-kv-table></template>
        </b-card>
      </template>
    </b-scrolling-list></template>

    <template v-slot:actions><b-button

      :to="localePath(`/leaderboard/trophies`)"
      primary
      sm
    >
      {{ $t('action.open.leaderboard.metric', { metric: $t('metric.trophies') }) }}
    </b-button></template>
  </b-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { BScrollingList, BKvTable } from '@schneefux/klicker/components'
import { useAsync, useContext } from '@/composables/compat'

export default defineComponent({
  components: {
    BScrollingList,
    BKvTable,
  },
  props: {
    limit: {
      type: Number,
      default: 5
    },
    elevation: {
      type: Number,
      default: 2
    },
  },
  setup(props) {
    const { $api } = useContext()

    const leaderboard = useAsync(async () => {
      const data = await $api.rankings.playersByCountry.query({
        country: 'global',
      }).catch(() => [])

      return data
        .slice(0, props.limit)
        .map(e => ({
          tag: e.tag,
          name: e.name,
          icon: e.icon.id,
          trophies: e.trophies,
        }))
    }, 'top-players')

    return {
      leaderboard,
    }
  },
})
</script>
