<template>
  <ad
    kind="top"
    class="[--content-size:100%] max-w-[var(--content-size)] mx-auto vm-main-content"
  ></ad>

  <main class="px-4 py-6 xl:pt-0 mt-2">
    <!-- desktop: title above ads, mobile: title below ads -->
    <h1
      v-if="title"
      class="text-3xl md:hidden mb-4"
    >{{ title }}</h1>

    <b-split-dashboard class="vm-main-content">
      <template v-slot:aside-left>
        <!-- set nav background color and padding to overlap Venatus' takeover -->
        <div
          v-if="leftSidebarHasContent || sections.length > 0"
          class="bg-background lg:px-6 lg:py-4 lg:rounded-2xl xl:mr-4 empty:hidden"
        >
          <slot name="aside-left"></slot>
          <b-scroll-spy
            v-if="sections.length > 0"
            id="sidenav"
            :sections="sections"
            :class="{
              'lg:mt-4': leftSidebarHasContent,
            }"
            toc-class="hidden lg:block"
            nav-class="top-14"
          ></b-scroll-spy>
        </div>
      </template>

      <template v-slot:aside-right>
        <slot name="aside-right"></slot>
      </template>

      <h1
        v-if="title"
        class="text-3xl hidden md:block"
      >{{ title }}</h1>

      <div>
        <slot></slot>
      </div>
    </b-split-dashboard>
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { BSplitDashboard, BScrollSpy } from '@schneefux/klicker/components'
import { Section } from '@schneefux/klicker/components/ui/b-scroll-spy.vue'

/**
 * split-dashboard page layout, where empty space in the sidebars is filled with ads.
 */
export default defineComponent({
  inheritAttrs: false,
  components: {
    BSplitDashboard,
    BScrollSpy,
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

    return {
      leftSidebarHasContent,
      rightSidebarHasContent,
    }
  },
})
</script>
