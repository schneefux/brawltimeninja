<template>
  <page :title="$t('tier-list.competition-winners.title')">
    <scrolling-dashboard
      v-if="maps != undefined"
      :length="maps.length"
      class="mt-8"
    >
      <template v-slot="{ limit }">
        <lazy
          v-for="(map, index) in maps"
          :key="map.mode + map.map"
          :render="index <= 2"
          :class="{
            'lg:hidden': index >= limit,
          }"
          class="dashboard__cell"
          style="--rows: 4; --columns: 4;"
        >
          <map-detail-card
            :map="map.map"
            :mode="map.mode"
            :timestamp="map.timestamp"
            id="0"
            link
          ></map-detail-card>
        </lazy>
      </template>
    </scrolling-dashboard>
  </page>
</template>

<script lang="ts">
import { defineComponent, useAsync, useContext } from '@nuxtjs/composition-api'
import { camelToKebab, getSeasonEnd, slugify } from '~/lib/util'

interface Event {
  timestamp: string
  map: string
  mode: string
  link: string
}

export default defineComponent({
  middleware: ['cached'],
  meta: {
    title: 'Competition Winners',
    screen: 'events',
  },
  setup() {
    const { $klicker } = useContext()

    const twoMonthsAgo = new Date()
    twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 8*7)
    const season = getSeasonEnd(twoMonthsAgo).toISOString().slice(0, 10)

    const maps = useAsync<Event[]>(async () => {
      const data = await $klicker.query({
        cubeId: 'map',
        dimensionsIds: ['mode', 'map'],
        metricsIds: ['timestamp', 'picks'],
        slices: {
          season: [season],
          mapLike: ['Competition Winner'],
        },
        sortId: 'timestamp',
      })

      return data.data
        // events overlap slightly and get misclassified... TODO fix this in backend
        .filter(row => row.metricsRaw.picks > 1000)
        .map(row => ({
          timestamp: row.metricsRaw.timestamp as string,
          map: row.dimensionsRaw.map.map,
          mode: row.dimensionsRaw.mode.mode,
          link: `/tier-list/mode/${camelToKebab(row.dimensionsRaw.mode.mode)}/map/${slugify(row.dimensionsRaw.map.map)}`,
        }))
    })

    return {
      maps,
    }
  },
})
</script>
