<template>
  <ad
    takeover
    first
  ></ad>

  <b-page no-container>
    <!-- desktop: title above ads, mobile: title below ads -->
    <b-title
      v-if="title"
      :title="title"
      class="mb-8 md:hidden"
    ></b-title>

    <b-split-dashboard>
      <template v-slot:aside-left>
        <slot name="aside-left"></slot>

        <!-- siderail will only render on desktop (lg) -->
        <ad
          v-if="!leftSidebarHasContent"
          siderail
        ></ad>

        <ad
          :class="{
            'hidden lg:block': !leftSidebarHasContent,
            // mobile: cancel dashboard gap-8, desktop: leave space for sticky footer
            'mt-8 -mb-8 md:mb-[110px]': true,
          }"
          instream
        ></ad>
      </template>

      <template v-slot:aside-right>
        <slot name="aside-right"></slot>

        <ad
          siderail
          :class="{
            'mt-8': rightSidebarHasContent,
            'mb-[110px]': true, // leave space for sticky footer
          }"
        ></ad>
      </template>

      <b-title
        v-if="title"
        :title="title"
        class="hidden md:block"
      ></b-title>

      <div
        :class="{
          '-mt-16 md:mt-0': !leftSidebarHasContent, // mobile: cancel gap-8 if there is no left sidebar
        }"
      >
        <slot></slot>
      </div>
    </b-split-dashboard>
  </b-page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { BPage, BSplitDashboard } from '@schneefux/klicker/components'

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

    return {
      leftSidebarHasContent,
      rightSidebarHasContent,
    }
  },
})
</script>
