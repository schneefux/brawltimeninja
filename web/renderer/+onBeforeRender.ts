import type { Config, PageContext } from './types'
import Sentry from '@sentry/vue'
import { getTraduoraToken, TraduoraToken } from '@/locales'

export { onBeforeRender }

let cachedTraduoraToken: TraduoraToken | undefined = undefined
async function onBeforeRender(pageContext: PageContext) {
  // during runtime, inject env variables from server
  let traduora: Config['traduora'] | undefined = undefined
  if (process.env.TRADUORA_URL != undefined) {
    const url = process.env.TRADUORA_URL
    const projectId = process.env.TRADUORA_PROJECT_ID ?? ''

    if (cachedTraduoraToken == undefined || cachedTraduoraToken?.expirationDate <= new Date()) {
      const clientId = process.env.TRADUORA_CLIENT_ID ?? ''
      const secret = process.env.TRADUORA_SECRET ?? ''
      cachedTraduoraToken = await getTraduoraToken({ url, clientId, secret })
    }

    traduora = {
      url,
      projectId,
      token: cachedTraduoraToken.token,
    }
  }

  const config: Config = {
    mediaUrl: process.env.MEDIA_URL ?? '',
    cubeUrl: process.env.CUBE_URL ?? '',
    managerUrl: process.env.MANAGER_URL ?? '',
    renderUrl: process.env.RENDER_URL ?? '',
    optimizeId: process.env.OPTIMIZE_ID ?? '',
    ga4Id: process.env.GA4_ID ?? '',
    uaId: process.env.UA_ID ?? '',
    adsensePubid: process.env.ADSENSE_PUBID ?? '',
    playwireRampPublisherId: process.env.PLAYWIRE_RAMP_PUBLISHER_ID ?? '',
    playwireRampSiteId: process.env.PLAYWIRE_RAMP_SITE_ID ?? '',
    playwireRampGa4Id: process.env.PLAYWIRE_RAMP_GA4_ID ?? '',
    quantcastChoiceId: process.env.QUANTCAST_CHOICE_ID ?? '',
    sentryDsn: process.env.SENTRY_DSN ?? '',
    traduora,
  }

  const sentry = Sentry

  return {
    pageContext: {
      envConfig: config, // "config" is internally used by VPS
      sentry,
      refs: {}, // for arbitrary data, see ssrRef()
    }
  }
}
