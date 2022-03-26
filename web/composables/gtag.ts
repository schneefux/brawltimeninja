import { wrapProperty } from '@nuxtjs/composition-api'

export const useTrackScroll = (trackingPageId: string) => {
  const gtag = wrapProperty('$gtag', false)()
  const makeVisibilityCallback = (trackingId: string) => (visible: boolean, element: any) =>  {
    if (visible) {
      gtag.event('scroll', {
        'event_category': trackingPageId,
        'event_label': trackingId,
      })
    }
  }

  return {
    gtag,
    makeVisibilityCallback,
  }
}

export const useGtag = wrapProperty('$gtag', false)