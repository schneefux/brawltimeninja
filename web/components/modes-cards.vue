<template>
  <div>
    <scrolling-dashboard>
      <map-best-brawlers-card
        v-for="(mode, index) in modes"
        :key="mode"
        :class="{
          'md:hidden': index >= (page + 1) * 3,
        }"
        :slices="{ mode: [mode] }"
        class="dashboard__cell"
        style="--rows: 1; --columns: 4;"
      ></map-best-brawlers-card>
    </scrolling-dashboard>

    <accordeon-buttons
      v-model="page"
      :pages="modes != undefined ? modes.length / 3 : 0"
      class="hidden md:flex"
    ></accordeon-buttons>
  </div>
</template>

<script lang="ts">
import { defineComponent, useContext, useAsync, ref } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const { $klicker } = useContext()
    const modes = useAsync(() => $klicker.queryAllModes())
    const page = ref(0)

    return {
      modes,
      page,
    }
  },
})
</script>
