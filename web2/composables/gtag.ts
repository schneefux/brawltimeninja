import { event } from 'vue-gtag'

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
