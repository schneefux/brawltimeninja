<template>
  <client-only>
    <b-dashboard-cell
      :rows="rows"
      :columns="columns"
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
  props: {
    rows: {
      type: Number,
      required: true
    },
    columns: {
      type: Number,
      required: true
    },
  },
})
</script>
