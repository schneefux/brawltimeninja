import { renderToString } from '@vue/server-renderer'
import { dangerouslySkipEscape, escapeInject } from 'vite-plugin-ssr'
import { createApp } from './app'
import type { Config, PageContext } from './types'
import type { PageContextBuiltIn } from 'vite-plugin-ssr'
import { dehydrate } from '@tanstack/vue-query'
import { renderSSRHead } from '@unhead/ssr'
import SuperJSON from 'superjson'

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
]

function onBeforeRender(pageContext: PageContext) {
  // during runtime, inject env variables from server
  const config: Config = {
    mediaUrl: process.env.MEDIA_URL ?? '',
    cubeUrl: process.env.CUBE_URL ?? '',
    managerUrl: process.env.MANAGER_URL ?? '',
    renderUrl: process.env.RENDER_URL ?? '',
    optimizeId: process.env.OPTIMIZE_ID ?? '',
    ga4Id: process.env.GA4_ID ?? '',
    uaId: process.env.UA_ID ?? '',
    adsensePubid: process.env.ADSENSE_PUBID ?? '',
  }

  return {
    pageContext: {
      config,
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
  router.push(pageContext.urlPathname)
  await router.isReady()

  let string = await renderToString(app)
  if (firstError) {
    //throw RenderErrorPage({ pageContext: {} })
    throw firstError
  }

  const payload = await renderSSRHead(head)
  const vueQueryState = dehydrate(queryClient)
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
