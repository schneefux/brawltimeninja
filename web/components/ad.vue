<template>
  <div
    v-if="takeover"
    v-bind="$attrs"
    class="text-center"
  >
    <client-only>
      <!-- hybrid-banner for takeover -->
      <!-- Desktop - Multisize Leaderboard: 728x90, 970x90, 970x250 -->
      <venatus-placement
        v-if="desktop"
        ad-id="65f94d46dd5aea6a13fd049b"
        ad-type="hybrid-banner"
        class="desktop-multileaderboard"
      ></venatus-placement>

      <!-- Mobile - In-Content: 300x250, 336x280, 320x100, 300x100 -->
      <venatus-placement
        v-if="!desktop"
        ad-id="65f94f9ddd5aea6a13fd04a1"
        ad-type="hybrid-banner"
        class="mobile-incontent"
      ></venatus-placement>

      <template v-slot:placeholder>
        <div class="placeholder-takeover"></div>
      </template>
    </client-only>
  </div>

  <div
    v-else-if="banner"
    v-bind="$attrs"
    class="text-center"
  >
    <client-only>
      <!-- Desktop - Article: 728x90, 970x90 -->
      <venatus-placement
        v-if="desktop"
        ad-id="65f94ee2dd5aea6a13fd049f"
        class="desktop-article"
      ></venatus-placement>

      <!-- Mobile - Leaderboard: 300x50, 320x50, 300x100, 320x100 -->
      <venatus-placement
        v-if="!desktop"
        ad-id="65f94f6d767223575b4de5b3"
        class="mobile-leaderboard"
      ></venatus-placement>

      <template v-slot:placeholder>
        <div class="placeholder-banner"></div>
      </template>
    </client-only>
  </div>

  <template v-else-if="siderail">
    <client-only>
      <div
        v-if="desktop"
        v-bind="$attrs"
        ref="ad"
        class="text-center"
      >
        <!-- Desktop Side Rail: 300x250, 300x600, 160x600, 336x280 -->
        <venatus-placement
          v-if="visible"
          ad-id="65f94d27767223575b4de5af"
          class="desktop-side-rail"
        ></venatus-placement>
      </div>
    </client-only>
  </template>

  <template v-else-if="cell">
    <!-- placeholder and lazy-loading are handled by cell wrapper-->
    <client-only>
      <b-dashboard-cell
        :rows="3"
        class="!col-span-full self-center"
        hide-empty
        lazy
      >
        <!-- Desktop - In-Content: 300x250, 336x280, 728x90 -->
        <venatus-placement
          v-if="desktop"
          ad-id="65f94d69767223575b4de5b1"
          class="desktop-incontent"
        ></venatus-placement>

        <!-- Mobile - In-Content: 300x250, 336x280, 320x100, 300x100 -->
        <venatus-placement
          v-if="!desktop"
          ad-id="65f94f9ddd5aea6a13fd04a1"
          class="mobile-incontent"
        ></venatus-placement>
      </b-dashboard-cell>
    </client-only>
  </template>

  <b-page-section
    v-else-if="instream"
    v-bind="$attrs"
    ref="ad"
    class="text-center -mx-4 lg:mx-0"
  >
    <!-- Instream - at least 410px wide, must be 16:9 -->
    <div
      v-if="visible"
      id="vm-av"
      data-format="isvideo"
      class="aspect-video vm-placement max-w-[480px] mx-auto"
    ></div>
  </b-page-section>

  <div
    v-else-if="instreamPlain"
    v-bind="$attrs"
    ref="ad"
    class="text-center -mx-4 lg:mx-0 w-[480px]"
  >
    <!-- Instream - at least 410px wide, must be 16:9 -->
    <div
      v-if="visible"
      id="vm-av"
      data-format="isvideo"
      class="aspect-video vm-placement w-full max-w-[480px] mx-auto"
    ></div>
  </div>

  <!-- default: section with in-content unit -->
  <b-page-section
    v-else
    v-bind="$attrs"
    ref="ad"
    class="text-center -mx-4 lg:mx-0"
  >
    <client-only>
      <!-- Desktop - In-Content: 300x250, 336x280, 728x90 -->
      <venatus-placement
        v-if="desktop && visible"
        ad-id="65f94d69767223575b4de5b1"
        class="desktop-incontent"
      ></venatus-placement>

      <!-- Mobile - In-Content: 300x250, 336x280, 320x100, 300x100 -->
      <venatus-placement
        v-if="!desktop && visible"
        ad-id="65f94f9ddd5aea6a13fd04a1"
        class="mobile-incontent"
      ></venatus-placement>

      <template v-slot:placeholder>
        <div class="placeholder-section"></div>
      </template>
    </client-only>
  </b-page-section>
</template>

<script lang="ts">
import { defineComponent, ref, watch, nextTick } from 'vue'
import { useBreakpoints, useIntersectionObserver } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { BDashboardCell } from '@schneefux/klicker/components'

export default defineComponent({
  inheritAttrs: false,
  components: {
    BDashboardCell,
  },
  props: {
    lazy: {
      type: Boolean,
      default: false
    },
    /** instream video wrapped by section */
    instream: {
      type: Boolean,
      default: false
    },
    /** just the instream */
    instreamPlain: {
      type: Boolean,
      default: false
    },
    /** in-content unit at the top */
    takeover: {
      type: Boolean,
      default: false
    },
    /** short unit */
    banner: {
      type: Boolean,
      default: false
    },
    /** tall desktop unit */
    siderail: {
      type: Boolean,
      default: false
    },
    /** in-content unit with b-dashboard-cell wrapper */
    cell: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const ad = ref<HTMLElement>()
    // always eager-load takeover because it is at the top of the page
    // always lazy-load siderail and instream, figure out whether they fit first
    const visible = ref((!props.lazy || props.takeover) && !props.siderail && !props.instream)

    if (!import.meta.env.SSR && !visible.value) {
      const { isSupported, stop } = useIntersectionObserver(ad, ([{ isIntersecting, target }]) => {
        const hidden = (target as HTMLElement)?.offsetParent === null

        if (isIntersecting && !hidden) {
          visible.value = true
          stop()
        }
      }, {
        rootMargin: `50% 50% 50% 50%`,
      })

      if (!isSupported) {
        visible.value = true
      }
    }

    const breakpoints = useBreakpoints({
      desktop: 1028,
    })
    const desktop = breakpoints.greaterOrEqual('desktop')

    const route = useRoute()
    const sideRailMaxWidth = ref(0)
    watch(route, () => {
      if (import.meta.env.SSR) {
        return
      }

      nextTick(() => {
        const mainEl = document.querySelector('main')
        // on desktop (1920px), most pages' main is 1536px
        // use 32px margin (4*8px) so that the 160px unit fits perfectly
        if (mainEl) {
          sideRailMaxWidth.value = (window.innerWidth - mainEl.clientWidth) / 2 - 32
        }
      })
    }, { immediate: true })

    return {
      ad,
      visible,
      desktop,
      sideRailMaxWidth,
    }
  },
})
</script>

<style lang="postcss" scoped>
.placeholder-takeover {
  margin: 0 auto;
  width: 100%;
  max-width: 336px;
  height: 280px;
}

@media (min-width: 1028px) {
  .placeholder-takeover {
    max-width: 970px;
    height: 250px;
  }
}

.desktop-article {
  margin: 0 auto;
  width: 100%;
  max-width: 970px;
  height: 90px;
}

.mobile-leaderboard {
  margin: 0 auto;
  width: 100%;
  max-width: 320px;
  height: 100px;
}

.placeholder-banner {
  margin: 0 auto;
  width: 100%;
  max-width: 320px;
  height: 100px;
}

@media (min-width: 1028px) {
  .placeholder-banner {
    max-width: 970px;
    height: 90px;
  }
}

.desktop-multileaderboard {
  margin: 0 auto;
  width: 100%;
  max-width: 970px;
  height: 250px;
}

.desktop-side-rail {
  width: 336px;
  height: 600px;
}

.mobile-incontent {
  margin: 0 auto;
  width: 100%;
  max-width: 336px;
  height: 280px;
}

.desktop-incontent {
  margin: 0 auto;
  width: 100%;
  max-width: 728px;
  height: 280px;
}

.placeholder-section {
  margin: 0 auto;
  width: 100%;
  max-width: 336px;
  height: 280px;
}

@media (min-width: 1028px) {
  .placeholder-section {
    max-width: 728px;
    height: 280px;
  }
}
</style>
