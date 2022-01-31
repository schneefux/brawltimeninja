<template>
  <div>
    <div
      v-if="title != undefined"
      class="mt-8"
    >
      <h2 class="text-2xl">
        {{ title }}
      </h2>
      <slot name="description"></slot>
    </div>

    <div
      :class="{
        'mt-4': title != undefined,
        'mt-8': title == undefined,
      }"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e),
        once: true,
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, wrapProperty } from '@nuxtjs/composition-api'

const useGtag = wrapProperty('$gtag', false)
export default defineComponent({
  props: {
    title: {
      type: String
    },
    trackingId: {
      type: String
    },
    trackingPageId: {
      type: String
    },
  },
  setup(props) {
    const gtag = useGtag()
    const trackScroll = (visible: boolean, element: any) =>  {
      if (visible && props.trackingPageId != undefined && props.trackingId != undefined) {
        gtag.event('scroll', {
          'event_category': props.trackingPageId,
          'event_label': props.trackingId,
        })
      }
    }

    return {
      trackScroll,
    }
  },
})
</script>
