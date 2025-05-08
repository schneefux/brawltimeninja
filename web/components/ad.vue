<template>
  <div
    v-if="kind == 'top'"
    v-bind="$attrs"
    :id="placementId"
    ref="placement"
    data-display-type="hybrid-banner"
    class="top-ad vm-placement"
  ></div>

  <b-page-section
    v-else-if="kind == 'first'"
    v-bind="$attrs"
  >
    <div
      :id="placementId"
      ref="placement"
      class="first-ad vm-placement"
    ></div>
  </b-page-section>

  <b-dashboard-cell
    v-else-if="kind == 'cell'"
    :rows="3"
    class="col-span-full! self-center"
    hide-empty
    lazy
  >
    <div
      :id="placementId"
      ref="placement"
      class="section-ad vm-placement"
    ></div>
  </b-dashboard-cell>

  <b-page-section
    v-else-if="kind == 'section'"
    v-bind="$attrs"
  >
    <div
      :id="placementId"
      ref="placement"
      class="section-ad vm-placement"
    ></div>
  </b-page-section>
</template>

<script lang="ts">
import { defineComponent, PropType, useTemplateRef, useId, computed } from 'vue'
import { BDashboardCell, BPageSection } from '@schneefux/klicker/components'
import { usePlacement } from '~/composables/venatus'

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
  setup(props) {
    const placementRef = useTemplateRef<HTMLElement>('placement')

    const id = useId()
    const placementId = computed(() => `ad-${id}`)

    const placementNames = computed(() => {
      if (props.kind == 'first') {
        /*
          first mid page unit
            - desktop: video
            - mobile: takeover MPU
        */
        return {
          desktop: 'video',
          mobile: 'mobile_takeover',
        }
      }

      if (props.kind == 'top') {
        /*
          top of the page unit
            - desktop: takeover billboard
            - mobile: video
        */
        return {
          /*
            data-display-type is not documented as requirement for takeovers in prosper,
            but sometimes it breaks ("Section hybrid-banner defect:  Destroying. No hybrid-banner")
          */
          desktop: 'desktop_takeover',
          mobile: 'video',
        }
      }

      if (props.kind == 'cell') {
        /*
          unit within a dashboard
            - desktop: billboard
            - mobile: MPU
        */
        return {
          desktop: 'billboard',
          mobile: 'mobile_mpu',
        }
      }

      /*
        mid page unit
          - desktop: billboard
          - mobile: MPU
      */
      return {
        desktop: 'billboard',
        mobile: 'mobile_mpu',
      }
    })

    usePlacement(placementId, placementRef, placementNames)

    return {
      placementId,
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
