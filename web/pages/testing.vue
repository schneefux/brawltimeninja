<template>
  <client-only>
    <brawler-starpower-stats brawler-name="Stu" brawler-id="stu" kind="starpowers"></brawler-starpower-stats>
  </client-only>
</template>

<script lang='ts'>
import Vue from 'vue'
import cubejs, { ResultSet } from '@cubejs-client/core'

export default Vue.extend({
  data() {
    return {
      data: {} as ResultSet<any>,
    };
  },
  fetchDelay: 0,
  fetchOnServer: false,
  async fetch() {

    const cubejsApi = cubejs('', {
      apiUrl: this.$config.cubeUrl + '/cubejs-api/v1',
      headers: { },
    })

    const events = await this.$klicker.query({
      cubeId: 'map',
      slices: {
        id: ["15000239"],
        season: [],
      },
      dimensionsIds: ['mode', 'map'],
      measurementsIds: ['eventId'],
      sortId: 'timestamp',
    })
    console.log(events)

    return;
    console.log(await cubejsApi.sql({
      measures: ['map.winRateAdj_measure', 'map.useRate_measure'],
      dimensions: ['map.brawler_dimension'],
      filters: [
        {
          member: 'map.mode_dimension',
          operator: 'equals',
          values: ['bounty'],
        },
        {
          member: 'map.map_dimension',
          operator: 'equals',
          values: ['Competition Entry'],
        },
      ],
    }))
    this.data = await cubejsApi.load({
      measures: ['map.winRateAdj_measure', 'map.useRate_measure'],
      dimensions: ['map.brawler_dimension'],
      filters: [
        {
          member: 'map.mode_dimension',
          operator: 'equals',
          values: ['bounty'],
        },
        {
          member: 'map.map_dimension',
          operator: 'equals',
          values: ['Competition Entry'],
        },
      ],
    })
  },
})
</script>
