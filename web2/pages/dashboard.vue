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
        <b-dashboard-cell :columns="2">
          <v-sample-size
            v-bind="data"
            :card="{}"
          ></v-sample-size>
        </b-dashboard-cell>
        <b-dashboard-cell :columns="2">
          <v-last-update
            v-bind="data"
            :card="{}"
          ></v-last-update>
        </b-dashboard-cell>
      </template>

      <template v-slot:data="data">
        <v-auto
          v-bind="data"
          :card="{}"
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
import { CDashboard, VAuto, BDashboardCell } from '@schneefux/klicker/components'
import { useSyncQueryAndRoute } from '~/composables/link'
import { computed, defineComponent } from 'vue'
import { useCacheHeaders } from '@/composables/compat'
import { useKlicker } from '@schneefux/klicker/composables'

export default defineComponent({
  components: {
    CDashboard,
    BDashboardCell,
    VAuto,
  },
  setup() {
    const $klicker = useKlicker()
    const urlQuery = useSyncQueryAndRoute($klicker.config, 'map')
    const query = computed<CubeQuery|CubeComparingQuery>({
      get() {
        return {
          ...urlQuery.value,
          confidenceInterval: true,
        }
      },
      set(value: CubeQuery|CubeComparingQuery) {
        urlQuery.value = value
      },
    })

    useCacheHeaders()

    return {
      query,
    }
  },
})
</script>
