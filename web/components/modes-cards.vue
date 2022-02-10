<template>
  <scrolling-dashboard
    v-if="modes != undefined"
    :length="modes.length"
    :page-size="4"
  >
    <template v-slot="{ limit }">
      <c-dashboard-cell
        v-for="(mode, index) in modes"
        :key="mode"
        :class="{
          'lg:hidden': index >= limit,
        }"
        :rows="2"
        :columns="3"
      >
        <map-best-brawlers-card
          :slices="{
            mode: [mode],
          }"
        ></map-best-brawlers-card>
      </c-dashboard-cell>
    </template>
  </scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent, useContext, useAsync } from '@nuxtjs/composition-api'
import { CDashboardCell } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    CDashboardCell,
  },
  setup() {
    const { $klicker } = useContext()
    const modes = useAsync(() => $klicker.queryAllModes())

    return {
      modes,
    }
  },
})
</script>
