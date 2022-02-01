<template>
  <scrolling-dashboard
    v-if="modes != undefined"
    :length="modes.length"
  >
    <template v-slot="{ limit }">
      <map-best-brawlers-card
        v-for="(mode, index) in modes"
        :key="mode"
        :class="{
          'lg:hidden': index >= limit,
        }"
        :slices="{ mode: [mode] }"
        class="dashboard__cell"
        style="--rows: 1; --columns: 4;"
      ></map-best-brawlers-card>
    </template>
  </scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent, useContext, useAsync, ref } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const { $klicker } = useContext()
    const modes = useAsync(() => $klicker.queryAllModes())

    return {
      modes,
    }
  },
})
</script>
