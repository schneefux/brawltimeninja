<template>
  <template v-if="allowed">
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
      </client-only>
    </template>

    <div
      v-else-if="instream"
      v-bind="$attrs"
      ref="ad"
      class="text-center -mx-4 w-[calc(100%+32px)] md:mx-0 md:w-full max-w-lg"
    >
      <!-- Instream - at least 410px wide, must be 16:9 -->
      <div
        v-if="visible"
        id="vm-av"
        data-format="isvideo"
        class="aspect-video vm-placement"
      ></div>
    </div>

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
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, nextTick } from 'vue'
import { useBreakpoints, useIntersectionObserver } from '@vueuse/core'
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
    takeover: {
      type: Boolean,
      default: false
    },
    banner: {
      type: Boolean,
      default: false
    },
    siderail: {
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
    // always lazy-load siderail and instream, figure out whether they fit first
    const visible = ref((!props.lazy || props.first) && !props.siderail && !props.instream)
    const { isApp } = useIsApp()

    const allowed = computed(() => props.first || isApp.value == undefined || isApp.value == false)

    if (!import.meta.env.SSR && !visible.value) {
      const { isSupported, stop } = useIntersectionObserver(ad, ([{ isIntersecting, target }]) => {
        const hidden = (target as HTMLElement)?.offsetParent === null

        if (isIntersecting && allowed.value && !hidden) {
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
      allowed,
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
