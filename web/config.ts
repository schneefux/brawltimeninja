export interface Config {
  mediaUrl: string
  cubeUrl: string
  managerUrl: string
  renderUrl: string
  ga4Id: string
  adsensePubid: string
  sentryDsn: string
  venatusSiteId: string
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
  venatusSiteId: process.env.VENATUS_SITE_ID ?? '',
  quantcastChoiceId: process.env.QUANTCAST_CHOICE_ID ?? '',
  sentryDsn: process.env.SENTRY_DSN ?? '',
  traduora: undefined,
}
