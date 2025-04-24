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
    class="text-center max-lg:w-full max-lg:max-w-[480px] max-lg:mx-auto"
  >
    <client-only>
      <venatus-placement
        v-if="desktop"
        placement-name="desktop_takeover"
        class="section"
      ></venatus-placement>

      <!-- Video - at least 410px wide, must be 16:9 -->
      <venatus-placement
        v-else
        placement-name="video"
        class="video"
      ></venatus-placement>

      <template v-slot:placeholder>
        <div class="top-placeholder vm-placement"></div>
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
    class="text-center lg:w-full lg:max-w-[480px] lg:mx-auto"
  >
    <client-only>
      <template v-if="visible">
        <venatus-placement
          v-if="desktop"
          placement-name="video"
          class="video"
        ></venatus-placement>

        <venatus-placement
          v-if="!desktop"
          placement-name="mobile_takeover"
          class="section"
        ></venatus-placement>
      </template>
      <div
        v-else
        class="first-placeholder vm-placement"
      ></div>

      <template v-slot:placeholder>
        <div class="first-placeholder vm-placement"></div>
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
        class="section"
      ></venatus-placement>

      <venatus-placement
        v-else
        placement-name="mobile_mpu"
        class="section"
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
    class="text-center"
  >
    <client-only>
      <template v-if="visible">
        <!-- Desktop - Billboard: 970x90, 728x90, 970x250, 300x250, 468x60 -->
        <venatus-placement
          v-if="desktop"
          placement-name="billboard"
          class="section"
        ></venatus-placement>

        <!-- Mobile - Mobile Mid Page Unit (MPU): 300x250, 300x100, 300x50, 320x50, 336x280 -->
        <venatus-placement
          v-else
          placement-name="mobile_mpu"
          class="section"
        ></venatus-placement>
      </template>
      <div
        v-else
        class="section vm-placement"
      ></div>

      <template v-slot:placeholder>
        <div class="section"></div>
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
.top-placeholder {
  /* video */
  margin: 0 auto;
  width: 100%;
  max-width: 512px;
  aspect-ratio: 16 / 9;
}

@media (min-width: 1024px) {
  .top-placeholder {
    /* section */
    margin: 0 auto;
    width: 100%;
    max-width: 970px;
    height: 250px;
    aspect-ratio: unset;
  }
}

.first-placeholder {
  /* section */
  margin: 0 auto;
  width: 100%;
  max-width: 336px;
  height: 280px;
}

@media (min-width: 1024px) {
  .first-placeholder {
    /* video */
    margin: 0 auto;
    width: 100%;
    max-width: 512px;
    aspect-ratio: 16 / 9;
  }
}

.section {
  margin: 0 auto;
  width: 100%;
  max-width: 336px;
  height: 280px;
}

@media (min-width: 1024px) {
  .section {
    max-width: 970px;
    height: 250px;
  }
}

.video {
  margin: 0 auto;
  width: 100%;
  max-width: 512px;
  aspect-ratio: 16 / 9;
}
</style>
