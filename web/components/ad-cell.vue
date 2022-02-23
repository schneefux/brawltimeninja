<template>
  <client-only>
    <c-dashboard-cell
      :rows="rows"
      :columns="columns"
      hide-empty
    >
      <adsense
        v-if="!isApp"
        data-ad-client="ca-pub-6856963757796636"
        :data-ad-slot="adSlot"
        data-full-width-responsive="yes"
        class="text-center self-center"
      />
    </c-dashboard-cell>
  </client-only>
</template>

<script lang="ts">
import { defineComponent, useStore, computed } from '@nuxtjs/composition-api'
import { CDashboardCell } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    CDashboardCell,
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
    const store = useStore<any>()
    const isApp = computed(() => store.state.isApp as boolean)

    return {
      isApp,
    }
  },
})
</script>
