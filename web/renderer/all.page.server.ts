import { renderToString } from '@vue/server-renderer'
import { dangerouslySkipEscape, escapeInject } from 'vite-plugin-ssr'
import { createApp } from './app'
import type { Config, PageContext } from './types'
import type { PageContextBuiltIn } from 'vite-plugin-ssr'
import { dehydrate } from '@tanstack/vue-query'
import { renderSSRHead } from '@unhead/ssr'
import SuperJSON from 'superjson'
import Sentry from '@sentry/vue'
import { getTraduoraToken, TraduoraToken } from '@/locales'

export { onBeforeRender }
export { passToClient }
export { render }

const passToClient = [
  'vueQueryState',
  'piniaState',
  'errorWhileRendering',
  'config',
  'validated',
  'statusCode',
  'redirectTo',
  'refs',
  'localeMessages',
]

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
      config,
      sentry,
      refs: {}, // for arbitrary data, see ssrRef()
    }
  }
}

async function render(pageContext: PageContextBuiltIn & PageContext) {
  const { app, head, pinia, router, queryClient } = createApp(pageContext)

  let firstError: unknown = undefined
  app.config.errorHandler = (err) => {
    firstError = firstError ?? err
    return false
  }
  router.push(pageContext.urlOriginal)
  await router.isReady()

  let string = await renderToString(app)
  if (firstError) {
    queryClient.unmount() // fixes memory leak
    throw firstError
  }

  const payload = await renderSSRHead(head)
  const vueQueryState = dehydrate(queryClient)
  queryClient.unmount() // fixes memory leak
  const piniaState = SuperJSON.stringify(pinia.state.value)

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html${dangerouslySkipEscape(payload.htmlAttrs)}>
      <head>
        ${dangerouslySkipEscape(payload.headTags)}
      </head>
      <body${dangerouslySkipEscape(payload.bodyAttrs)}>
        ${dangerouslySkipEscape(payload.bodyTagsOpen)}
        <div id="app">${dangerouslySkipEscape(string)}</div>
        ${dangerouslySkipEscape(payload.bodyTags)}
      </body>
    </html>`

  return {
    documentHtml,
    pageContext: {
      vueQueryState,
      piniaState,
    },
  }
}
