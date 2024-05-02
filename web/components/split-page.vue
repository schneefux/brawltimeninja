<template>
  <ad takeover></ad>

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
          v-if="!leftSidebarHasContent"
          :class="{
            // TODO: when left sidebar has content, show a smaller siderail (max. 320x460)
            // mobile: cancel dashboard gap-8, desktop: leave space for sticky footer
            'mt-8 -mb-8 md:mb-[110px]': true,
          }"
          siderail
        ></ad>
      </template>

      <template v-slot:aside-right>
        <slot name="aside-right"></slot>

        <ad
          v-if="!rightSidebarHasContent"
          :class="{
            // TODO: when right sidebar has content, show a smaller siderail (max. 320x460)
            'md:mb-[110px]': true, // leave space for sticky footer
          }"
          siderail
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
