<template>
  <div>
    <h1>Welcome</h1>
    <map-best-brawlers-table></map-best-brawlers-table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MapBestBrawlersTable from '~/components/map-best-brawlers-table.vue'

export default defineComponent({
  components: {
    MapBestBrawlersTable,
  },
})
</script>
