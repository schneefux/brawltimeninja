<template>
  <client-only>
    <b-dashboard-cell
      :rows="rows"
      :columns="columns"
      hide-empty
      lazy
    >
      <div
        v-if="!isApp && !playwire"
        class="text-center self-center"
      >
        <adsense
          :data-ad-slot="adSlot"
          data-ad-client="ca-pub-6856963757796636"
          data-full-width-responsive
        ></adsense>
      </div>
    </b-dashboard-cell>
  </client-only>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { BDashboardCell } from '@schneefux/klicker/components'
import { useIsApp } from '~/composables/app'
import { useConfig } from '@/composables/compat'

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
    instance: {
      type: String
    },
  },
  setup() {
    const config = useConfig()
    const playwire = config.playwireRampPublisherId
    const { isApp } = useIsApp()

    return {
      isApp,
      playwire,
    }
  },
})
</script>
