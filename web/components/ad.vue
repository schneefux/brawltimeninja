<template>
  <b-dashboard-cell
    v-if="cell"
    :rows="3"
    class="col-span-full! self-center"
    hide-empty
    lazy
  >
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
  </b-dashboard-cell>

  <component
    v-else
    :is="plain ? 'div' : 'b-page-section'"
    v-bind="$attrs"
    ref="ad"
    :class="{
      'text-center': true,
      'w-full max-w-[480px] lg:mx-auto': plain && instream,
    }"
  >
    <!-- in-content (hybrid-banner) for takeover -->
    <client-only v-if="takeover">
      <!-- Desktop - Multisize Leaderboard: 728x90, 970x90, 970x250 -->
      <venatus-placement
        v-if="desktop && visible"
        ad-id="65f94d46dd5aea6a13fd049b"
        ad-type="hybrid-banner"
        class="desktop-multileaderboard"
      ></venatus-placement>

      <!-- Mobile - In-Content: 300x250, 336x280, 320x100, 300x100 -->
      <venatus-placement
        v-if="!desktop && visible"
        ad-id="65f94f9ddd5aea6a13fd04a1"
        ad-type="hybrid-banner"
        class="mobile-incontent"
      ></venatus-placement>

      <template v-slot:placeholder>
        <div class="placeholder-takeover"></div>
      </template>
    </client-only>

    <client-only v-else-if="banner">
      <!-- Desktop - Article: 728x90, 970x90 -->
      <venatus-placement
        v-if="desktop && visible"
        ad-id="65f94ee2dd5aea6a13fd049f"
        class="desktop-article"
      ></venatus-placement>

      <!-- Mobile - Leaderboard: 300x50, 320x50, 300x100, 320x100 -->
      <venatus-placement
        v-if="!desktop && visible"
        ad-id="65f94f6d767223575b4de5b3"
        class="mobile-leaderboard"
      ></venatus-placement>

      <template v-slot:placeholder>
        <div class="placeholder-banner"></div>
      </template>
    </client-only>

    <!-- Instream - at least 410px wide, must be 16:9 -->
    <client-only v-else-if="instream">
      <div
        v-if="visible"
        id="vm-av"
        data-format="isvideo"
        class="instream vm-placement"
        @click="onVideoPlayerClicked"
      ></div>
      <template v-slot:placeholder>
        <div class="instream vm-placement"></div>
      </template>
    </client-only>

    <!-- default -->
    <client-only v-else>
      <!-- Desktop - Multisize Leaderboard: 728x90, 970x90, 970x250 -->
      <venatus-placement
        v-if="desktop && visible"
        ad-id="65f94d46dd5aea6a13fd049b"
        class="desktop-multileaderboard"
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
  </component>
</template>

<script lang="ts">
import { defineComponent, ref, useTemplateRef } from 'vue'
import { useBreakpoints, useIntersectionObserver } from '@vueuse/core'
import { BDashboardCell, BPageSection } from '@schneefux/klicker/components'
import { useTrackScroll } from '~/composables/gtag'

export default defineComponent({
  inheritAttrs: false,
  components: {
    BDashboardCell,
    BPageSection,
  },
  props: {
    /** takeover and instream do not implement lazy-loading because they are usually ATF */
    lazy: {
      type: Boolean,
      default: false
    },
    /** do not render b-section wrapper */
    plain: {
      type: Boolean,
      default: false
    },
    /** instream video */
    instream: {
      type: Boolean,
      default: false
    },
    /** in-content unit */
    takeover: {
      type: Boolean,
      default: false
    },
    /** short unit */
    banner: {
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
    const adRef = useTemplateRef<HTMLElement>('ad')
    const visible = ref(!props.lazy)

    if (!import.meta.env.SSR && !visible.value) {
      const { isSupported, stop } = useIntersectionObserver(adRef, ([{ isIntersecting, target }]) => {
        const hidden = (target as HTMLElement)?.offsetParent === null

        if (isIntersecting && !hidden) {
          visible.value = true
          stop()
        }
      }, {
        rootMargin: `0px 0px 200px 0px`,
      })

      if (!isSupported) {
        visible.value = true
      }
    }

    const { trackInteraction: trackInteractionVideo } = useTrackScroll('video')
    const { trackInteraction: trackInteractionInstream } = useTrackScroll('instream')

    const onVideoPlayerClicked = async (e: MouseEvent) => {
      const isPlayingAd = (document.querySelector('.avp-video-ad') as any)?.style.visibility != 'hidden'
      const trackInteraction = (type: string) => {
        console.log('interacted with video player: %s, ad playing: %s', type, isPlayingAd)
        if (isPlayingAd) {
          trackInteractionInstream(type)
        } else {
          trackInteractionVideo(type)
        }
      }

      const target = e.target as HTMLElement|null
      if (target?.closest('.avp-close-floating-button,#fullscreen')) {
        trackInteraction('close-floating')
      }

      if (target?.closest('.avp-fullscreen-button')) {
        trackInteraction('maximize')
      }
    }

    const breakpoints = useBreakpoints({
      desktop: 1028,
    })
    const desktop = breakpoints.greaterOrEqual('desktop')

    return {
      visible,
      desktop,
      onVideoPlayerClicked,
    }
  },
})
</script>

<style scoped>
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

.instream {
  margin: 0 auto;
  width: 100%;
  max-width: 512px;
  aspect-ratio: 16 / 9;
}
</style>
