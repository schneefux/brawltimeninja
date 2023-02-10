import { watch } from "vue"
import { usePreferencesStore } from "@/stores/preferences"
import { event, optIn, optOut } from "vue-gtag"

export const useTrackScroll = (trackingPageId: string) => {
  const makeVisibilityCallback = (trackingId: string) => (visible: boolean, element: any) =>  {
    if (visible) {
      event('scroll', {
        'event_category': trackingPageId,
        'event_label': trackingId,
      })
    }
  }
  const trackInteraction = (trackingId: string) => {
    event('interact', {
      'event_category': trackingPageId,
      'event_label': trackingId,
    })
  }

  return {
    trackInteraction,
    makeVisibilityCallback,
  }
}

export function useAnalytics() {
  const store = usePreferencesStore()

  watch(() => store.adsAllowed, (allowed) => {
    if (import.meta.env.SSR) {
      return
    }

    if (allowed) {
      optIn()
    } else {
      optOut()
    }
  }, {
    immediate: true,
  })
}
