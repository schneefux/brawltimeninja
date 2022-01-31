<template>
  <page :title="$t('tier-list.competition-winners.title')">
    <scrolling-dashboard class="mt-8">
      <lazy
        v-for="(map, index) in maps"
        :key="map.mode + map.map"
        :render="index <= 2"
        :class="{
          'md:hidden': index >= (page + 1) * 3,
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
    </scrolling-dashboard>

    <accordeon-buttons
      v-model="page"
      :pages="maps != undefined ? maps.length / 3 : 0"
      class="hidden md:flex"
    ></accordeon-buttons>
  </page>
</template>

<script lang="ts">
import { defineComponent, useAsync, useContext, ref } from '@nuxtjs/composition-api'
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

    const page = ref(0)

    return {
      maps,
      page,
    }
  },
})
</script>
