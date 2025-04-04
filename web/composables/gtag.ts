import { event } from "vue-gtag"
import { useMeta } from "./compat"

export const useTrackScroll = (trackingPageId: string) => {
  const makeVisibilityCallback = (trackingId: string) => (visible: boolean, element?: any) =>  {
    if (visible) {
      event('scroll_visibility', {
        'visible_page': trackingPageId,
        'visible_section': trackingId,
      })
    }
  }
  const trackInteraction = (trackingId: string) => {
    event('interact', {
      'interact_page': trackingPageId,
      'interact_section': trackingId,
    })
  }

  return {
    trackInteraction,
    makeVisibilityCallback,
  }
}

export function useInstallGtag(ga4Id: string) {
  useMeta(() => ({
    script: [ {
      key: 'gtag',
      // TODO vue-gtag installs the same script again when mounted
      src: `https://www.googletagmanager.com/gtag/js?id=${ga4Id}&l=dataLayer`,
      async: true,
      tagPriority: 31,
    } ],
  }))
}
