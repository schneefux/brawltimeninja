import { renderToString } from '@vue/server-renderer'
import { dangerouslySkipEscape, escapeInject } from 'vite-plugin-ssr'
import { createApp } from './app'
import type { Config, PageContext } from './types'
import type { PageContextBuiltIn } from 'vite-plugin-ssr'
import { dehydrate } from '@tanstack/vue-query'
import { renderSSRHead } from '@unhead/ssr'

export { onBeforeRender }
export { passToClient }
export { render }

const passToClient = [
  'pageProps',
  'vueQueryState',
  'documentProps',
  'errorWhileRendering',
  'config',
  'validated',
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
  const { app, head, router, queryClient } = await createApp(pageContext)

  router.push(pageContext.urlPathname)
  await router.isReady()

  const string = await renderToString(app) // use string - streaming interferes with data loading
  const payload = await renderSSRHead(head)
  const vueQueryState = dehydrate(queryClient)

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
    },
  }
}
