import { watch } from "vue"
import { usePreferencesStore } from "@/stores/preferences"
import { event, optIn } from "vue-gtag"
import { useIsApp } from "./app"

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
  const { isPwa, isTwa } = useIsApp()

  const stop = watch(() => store.adsAllowed, async (value) => {
    if (value == true) {
      optIn()

      event('branch_dimension', {
        'branch': import.meta.env.VITE_BRANCH || '',
        'non_interaction': true,
      })
      event('is_pwa_dimension', {
        'is_pwa': isPwa.value,
        'non_interaction': true,
      })
      event('is_twa_dimension', {
        'is_twa': isTwa.value,
        'non_interaction': true,
      })

      stop()
    }
  }, {
    immediate: true,
  })
}
