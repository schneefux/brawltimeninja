<template>
  <b-page no-container>
    <b-split-dashboard>
      <template v-slot:aside-left>
        <slot name="aside-left"></slot>

        <ad
          instream
          :class="{
            'mt-8': 'aside-left' in $slots,
            // do not show the ad as the only content, it is too close to the takeover
            'hidden lg:block': !('aside-left' in $slots),
          }"
        ></ad>
      </template>

      <template v-slot:aside-right>
        <slot name="aside-right"></slot>

        <ad
          siderail
          :class="{
            'mt-8': 'aside-right' in $slots,
          }"
        ></ad>
      </template>

      <b-title :title="title"></b-title>

      <div>
        <slot></slot>
      </div>
    </b-split-dashboard>
  </b-page>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { BPage, BSplitDashboard } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BSplitDashboard,
    BPage,
  },
  props: {
    title: {
      type: String,
      required: true
    },
  },
})
</script>
