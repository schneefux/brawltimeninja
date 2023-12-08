<template>
  <b-card :title="$t('leaderboard.by-metric', { metric: $t('metric.trophies') })">
    <template v-slot:content>
      <p id="description">
        {{ $t('leaderboard.player.description', { length: rows.length }) }}
      </p>
      <div id="table" class="mt-2">
        <player-rank-table
          :columns="['trophies']"
          :column-names="[$t('metric.trophies')]"
          :rows="rows"
        ></player-rank-table>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { useApi, useAsync, useCacheHeaders } from '~/composables/compat'
import { defineComponent, computed } from 'vue'
import { PlayerRankTableRow } from '~/components/player/player-rank-table.vue'

export default defineComponent({
  setup() {
    const $api = useApi()

    const leaderboard = useAsync(() => $api.rankings.playersByCountry.query({
      country: 'global',
    }).catch(() => []), 'leaderboard-trophies')

    const rows = computed<PlayerRankTableRow[]>(() => {
      return leaderboard.value?.map(e => ({
        player_name: e.name,
        player_tag: e.tag,
        player_icon_id: e.icon.id,
        trophies: e.trophies,
      })) ?? []
    })

    useCacheHeaders()

    return {
      rows,
    }
  },
})
</script>
