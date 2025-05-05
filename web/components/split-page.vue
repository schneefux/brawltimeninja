<template>
  <ad kind="top"></ad>

  <b-page>
    <!-- desktop: title above ads, mobile: title below ads -->
    <b-title
      v-if="title"
      :title="title"
      class="mb-4 md:hidden"
    ></b-title>

    <b-split-dashboard center-class="vm-main-content">
      <template v-slot:aside-left>
        <div
          v-if="leftSidebarHasContent || sections.length > 0"
          class="bg-background lg:px-6 lg:py-4 lg:rounded-2xl xl:mr-4 empty:hidden"
        >
          <!-- set nav background color and padding to overlap Venatus' takeover -->
          <b-scroll-spy
            v-if="sections.length > 0"
            id="sidenav"
            :sections="sections"
            toc-class="hidden lg:block"
            nav-class="top-14"
          ></b-scroll-spy>
          <slot name="aside-left"></slot>
        </div>
      </template>

      <template v-slot:aside-right>
        <slot name="aside-right"></slot>
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
import { computed, defineComponent, PropType } from 'vue'
import { BPage, BSplitDashboard, BScrollSpy } from '@schneefux/klicker/components'
import { useRoute } from 'vue-router'
import { Section } from '@schneefux/klicker/components/ui/b-scroll-spy.vue'

/**
 * split-dashboard page layout, where empty space in the sidebars is filled with ads.
 */
export default defineComponent({
  inheritAttrs: false,
  components: {
    BSplitDashboard,
    BScrollSpy,
    BPage,
  },
  props: {
    title: {
      type: String,
      required: false
    },
    sections: {
      type: Array as PropType<Section[]>,
      required: false,
      default: () => [],
    }
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
