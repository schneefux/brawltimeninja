<template>
  <b-page title="Brawl Stars Meta Dashboard" no-container>
    <c-dashboard
      v-model="query"
      :configurator="{
        configureCube: true,
        configureMetrics: true,
        configureMultipleMetrics: true,
        configureDimensions: true,
        configureCompareMode: true,
      }"
      class="mt-2"
      slicer
    >
      <template v-slot:totals="data">
        <c-dashboard-cell :columns="2">
          <v-sample-size
            v-bind="data"
            card
          ></v-sample-size>
        </c-dashboard-cell>
        <c-dashboard-cell :columns="2">
          <v-last-update
            v-bind="data"
            card
          ></v-last-update>
        </c-dashboard-cell>
      </template>

      <template v-slot:data="data">
        <v-auto
          v-bind="data"
          card
          for-grid
          all
        ></v-auto>
      </template>
    </c-dashboard>

    <c-share class="mt-4"></c-share>
  </b-page>
</template>

<script lang="ts">
import { CubeQuery, CubeComparingQuery } from '@schneefux/klicker/types'
import { CDashboard, VAuto, CDashboardCell } from '@schneefux/klicker/components'
import { useSyncQueryAndRoute } from '~/composables/link'
import { computed, defineComponent, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
  components: {
    CDashboard,
    CDashboardCell,
    VAuto,
  },
  setup() {
    const { $klicker } = useContext()
    const urlQuery = useSyncQueryAndRoute($klicker.config, 'map')
    const query = computed<CubeQuery|CubeComparingQuery>({
      get() {
        return {
          ...urlQuery.value,
          confidenceInterval: true,
        }
      },
      set(value) {
        urlQuery.value = value
      },
    })

    return {
      query,
    }
  },
  middleware: ['cached'],
})
</script>
