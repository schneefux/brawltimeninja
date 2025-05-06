export interface Config {
  mediaUrl: string
  cubeUrl: string
  managerUrl: string
  renderUrl: string
  enableExtraApi: boolean
  ga4Id: string
  sentryDsn: string
  venatusSiteId: string
  quantcastChoiceId: string
  enebaId: string
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
  enableExtraApi: !!process.env.ENABLE_EXTRA_API,
  ga4Id: process.env.GA4_ID ?? '',
  venatusSiteId: process.env.VENATUS_SITE_ID ?? '',
  quantcastChoiceId: process.env.QUANTCAST_CHOICE_ID ?? '',
  enebaId: process.env.ENEBA_ID ?? '',
  sentryDsn: process.env.SENTRY_DSN ?? '',
  traduora: undefined,
}
