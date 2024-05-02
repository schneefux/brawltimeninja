<template>
  <ad
    v-if="topBannerType == 'takeover'"
    takeover
    plain
  ></ad>
  <ad
    v-else-if="topBannerType == 'instream'"
    instream
    plain
  ></ad>

  <b-page no-container>
    <!-- desktop: title above ads, mobile: title below ads -->
    <b-title
      v-if="title"
      :title="title"
      class="mb-4 md:hidden"
    ></b-title>

    <b-split-dashboard>
      <template v-slot:aside-left>
        <slot name="aside-left"></slot>

        <!-- siderail will only render on desktop (lg) -->
        <ad
          :class="{
            'md:mt-8': leftSidebarHasContent,
            'md:mb-[110px]': true, // leave space for sticky footer
          }"
          siderail
          plain
          lazy
        ></ad>
      </template>

      <template v-slot:aside-right>
        <slot name="aside-right"></slot>

        <ad
          :class="{
            'md:mt-8': rightSidebarHasContent,
            'md:mb-[110px]': true, // leave space for sticky footer
          }"
          siderail
          plain
          lazy
        ></ad>
      </template>

      <b-title
        v-if="title"
        :title="title"
        class="hidden md:block"
      ></b-title>

      <div>
        <slot></slot>
      </div>
    </b-split-dashboard>
  </b-page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { BPage, BSplitDashboard } from '@schneefux/klicker/components'
import { useRoute } from 'vue-router'

/**
 * split-dashboard page layout, where empty space in the sidebars is filled with ads.
 */
export default defineComponent({
  components: {
    BSplitDashboard,
    BPage,
  },
  props: {
    title: {
      type: String,
      required: false
    },
  },
  setup(props, { slots }) {
    // when there is no content in the left sidebar
    // mobile: keep it empty as it is too close to the takeover
    // desktop: fill it with a left siderail
    const leftSidebarHasContent = computed(() => 'aside-left' in slots)

    const rightSidebarHasContent = computed(() => 'aside-right' in slots)

    const route = useRoute()
    const topBannerType = computed(() => route.meta.topBannerType as string ?? 'takeover')

    return {
      leftSidebarHasContent,
      rightSidebarHasContent,
      topBannerType,
    }
  },
})
</script>
