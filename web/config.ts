export interface Config {
  mediaUrl: string
  cubeUrl: string
  managerUrl: string
  renderUrl: string
  ga4Id: string
  adsensePubid: string
  sentryDsn: string
  playwireRampPublisherId: string
  playwireRampSiteId: string
  playwireRampGa4Id: string
  quantcastChoiceId: string
  traduora?: {
    url: string
    projectId: string
    token: string
  }
}

export const config: Config = {
  mediaUrl: process.env.MEDIA_URL ?? '',
  cubeUrl: process.env.CUBE_URL ?? '',
  managerUrl: process.env.MANAGER_URL ?? '',
  renderUrl: process.env.RENDER_URL ?? '',
  ga4Id: process.env.GA4_ID ?? '',
  adsensePubid: process.env.ADSENSE_PUBID ?? '',
  playwireRampPublisherId: process.env.PLAYWIRE_RAMP_PUBLISHER_ID ?? '',
  playwireRampSiteId: process.env.PLAYWIRE_RAMP_SITE_ID ?? '',
  playwireRampGa4Id: process.env.PLAYWIRE_RAMP_GA4_ID ?? '',
  quantcastChoiceId: process.env.QUANTCAST_CHOICE_ID ?? '',
  sentryDsn: process.env.SENTRY_DSN ?? '',
  traduora: undefined,
}
