import { event } from "vue-gtag"

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
