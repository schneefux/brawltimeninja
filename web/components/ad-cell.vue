<template>
  <client-only>
    <b-dashboard-cell
      :rows="3"
      class="!col-span-full self-center"
      hide-empty
      lazy
    >
      <ad cell></ad>
    </b-dashboard-cell>
  </client-only>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { BDashboardCell } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BDashboardCell,
  },
})
</script>
