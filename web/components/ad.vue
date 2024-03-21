<template>
  <template v-if="allowed">
    <div
      v-if="banner"
      v-bind="$attrs"
      class="text-center -mx-4"
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
          <div style="width: 100%; height: 100px;"></div>
        </template>
      </client-only>
    </div>

    <!-- Desktop Side Rail: 300x250, 300x600, 160x600, 336x280 -->
    <div
      v-else-if="scraper"
      v-bind="$attrs"
    >
      <venatus-placement
        v-if="desktop && sideRailMaxWidth >= 160"
        ad-id="65f94d27767223575b4de5af"
        class="desktop-side-rail"
      ></venatus-placement>
    </div>

    <template v-else-if="cell">
      <!-- placeholder and lazy-loading are handled by cell wrapper-->
      <!-- Mobile - In-Content: 300x250, 336x280, 320x100, 300x100 -->
      <venatus-placement
        v-bind="$attrs"
        ad-id="65f94f9ddd5aea6a13fd04a1"
        class="mobile-incontent"
      ></venatus-placement>
    </template>

    <template v-else-if="instream">
      <div
        v-bind="$attrs"
        id="vm-av"
        data-format="isvideo"
        class="aspect-video vm-placement"
      ></div>
    </template>

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
          <div style="width: 100%; height: 280px;"></div>
        </template>
      </client-only>
    </b-page-section>
  </template>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, watch, nextTick } from 'vue'
import { useBreakpoints, useIntersectionObserver, useElementSize, useWindowSize } from '@vueuse/core'
import { useIsApp } from '~/composables/app'
import { useRoute } from 'vue-router'

export default defineComponent({
  inheritAttrs: false,
  props: {
    first: {
      type: Boolean,
      default: false
    },
    lazy: {
      type: Boolean,
      default: false
    },
    banner: {
      type: Boolean,
      default: false
    },
    scraper: {
      type: Boolean,
      default: false
    },
    cell: {
      type: Boolean,
      default: false
    },
    instream: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const ad = ref<HTMLElement>()
    const visible = ref(!props.lazy || props.first)
    const { isApp } = useIsApp()

    const allowed = computed(() => props.first || isApp.value == undefined || isApp.value == false)

    if (!import.meta.env.SSR) {
      const { isSupported, stop } = useIntersectionObserver(ad, ([{ isIntersecting }]) => {
        if (isIntersecting && allowed.value) {
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
      desktop: 728,
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
      allowed,
      desktop,
      sideRailMaxWidth,
    }
  },
})
</script>

<style lang="postcss" scoped>
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

.desktop-side-rail {
  width: 100%;
  max-width: 336px;
  height: 600px;
}

.desktop-incontent {
  margin: 0 auto;
  width: 100%;
  max-width: 728px;
  height: 280px;
}

.mobile-incontent {
  margin: 0 auto;
  width: 100%;
  max-width: 336px;
  height: 280px;
}
</style>
