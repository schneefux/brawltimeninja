<template>
  <client-only>
    <b-dashboard-cell
      :rows="rows"
      :columns="columns"
      hide-empty
      lazy
    >
      <adsense
        v-if="!isApp"
        :data-ad-slot="adSlot"
        data-ad-client="ca-pub-6856963757796636"
        data-full-width-responsive="yes"
        class="text-center self-center"
      ></adsense>
    </b-dashboard-cell>
  </client-only>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { BDashboardCell } from '@schneefux/klicker/components'
import { isApp } from '~/composables/app'

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
    adSlot: {
      type: String,
      required: true
    },
  },
  setup() {
    return {
      isApp,
    }
  },
})
</script>
