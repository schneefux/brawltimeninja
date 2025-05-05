<template>
  <!--
    top of the page unit
      - desktop: takeover billboard
      - mobile: video
      - eager
  -->
  <div
    v-if="kind == 'top'"
    v-bind="$attrs"
    ref="ad"
    class="lg:flex lg:justify-center"
  >
    <client-only>
      <!--
        data-display-type is not documented in prosper,
        but sometimes it breaks ("Section hybrid-banner defect:  Destroying. No hybrid-banner")
      -->
      <venatus-placement
        v-if="desktop"
        placement-name="desktop_takeover"
        data-display-type="hybrid-banner"
        class="top-ad"
      ></venatus-placement>

      <venatus-placement
        v-else
        placement-name="video"
        class="top-ad"
      ></venatus-placement>

      <template v-slot:placeholder>
        <div class="top-ad vm-placement"></div>
      </template>
    </client-only>
  </div>

  <!--
    first mid page unit
      - desktop: video
      - mobile: takeover MPU
      - lazy
  -->
  <b-page-section
    v-else-if="kind == 'first'"
    v-bind="$attrs"
    ref="ad"
  >
    <client-only>
      <template v-if="visible">
        <venatus-placement
          v-if="desktop"
          placement-name="video"
          class="first-ad"
        ></venatus-placement>

        <venatus-placement
          v-if="!desktop"
          placement-name="mobile_takeover"
          class="first-ad"
        ></venatus-placement>
      </template>
      <div
        v-else
        class="first-ad vm-placement"
      ></div>

      <template v-slot:placeholder>
        <div class="first-ad vm-placement"></div>
      </template>
    </client-only>
  </b-page-section>

  <!--
    unit within a dashboard
      - same as mid page unit below
      - parent takes care of lazy-loading and placeholder
  -->
  <b-dashboard-cell
    v-else-if="kind == 'cell'"
    :rows="3"
    class="col-span-full! self-center"
    hide-empty
    lazy
  >
    <client-only>
      <venatus-placement
        v-if="desktop"
        placement-name="billboard"
        class="section-ad"
      ></venatus-placement>

      <venatus-placement
        v-else
        placement-name="mobile_mpu"
        class="section-ad"
      ></venatus-placement>
    </client-only>
  </b-dashboard-cell>

  <!--
    mid page unit
      - desktop: billboard
      - mobile: MPU
      - lazy
  -->
  <b-page-section
    v-else-if="kind == 'section'"
    v-bind="$attrs"
    ref="ad"
  >
    <client-only>
      <template v-if="visible">
        <venatus-placement
          v-if="desktop"
          placement-name="billboard"
          class="section-ad"
        ></venatus-placement>

        <venatus-placement
          v-else
          placement-name="mobile_mpu"
          class="section-ad"
        ></venatus-placement>
      </template>
      <div
        v-else
        class="section-ad vm-placement"
      ></div>

      <template v-slot:placeholder>
        <div class="section-ad"></div>
      </template>
    </client-only>
  </b-page-section>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, useTemplateRef } from 'vue'
import { useBreakpoints, useIntersectionObserver } from '@vueuse/core'
import { BDashboardCell, BPageSection } from '@schneefux/klicker/components'

export default defineComponent({
  inheritAttrs: false,
  components: {
    BDashboardCell,
    BPageSection,
  },
  props: {
    kind: {
      type: String as PropType<'top'|'first'|'cell'|'section'>,
      default: 'section',
    },
  },
  setup() {
    const adRef = useTemplateRef<HTMLElement>('ad')
    const visible = ref(false)

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

    const breakpoints = useBreakpoints({
      desktop: 1024, // breakpoint which Venatus uses
    })
    const desktop = breakpoints.greaterOrEqual('desktop')

    return {
      visible,
      desktop,
    }
  },
})
</script>

<style scoped>
/*
  prosper will:
  - insert a span container
  - expand it to the largest configured size
  - center the ad within this container

  so our placeholders will reserve the largest configured size
  and use min-width/height in case prosper renders a larger one
*/

@media (max-width: 1023px) {
  .top-ad {
    /* video */
    /* at least 410px wide, must be 16:9, configured for 440px by Venatus */
    max-width: 440px;
    aspect-ratio: 16 / 9;
  }
}

@media (min-width: 1024px) {
  .top-ad {
    /* billboard/takeover */
    /* 970x90, 728x90, 970x250, 300x250, 468x60 */
    min-width: 970px;
    min-height: 250px;
  }
}

@media (max-width: 1023px) {
  .first-ad {
    /* mobile MPU */
    /* 300x250, 300x100, 300x50, 320x50, 336x280 */
    /* TODO mobile takeover seems misconfigured on Venatus' end, it's missing 336x280 */
    min-width: 330px;
    min-height: 250px;
  }
}

@media (min-width: 1024px) {
  .first-ad {
    /* video */
    margin: 0 auto;
    width: 440px;
    aspect-ratio: 16 / 9;
  }
}

@media (max-width: 1023px) {
  .section-ad {
    /* mobile MPU */
    min-width: 336px;
    min-height: 280px;
  }
}

@media (min-width: 1024px) {
  .section-ad {
    /* billboard */
    min-width: 970px;
    min-height: 250px;
  }
}
</style>
