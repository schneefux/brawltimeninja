import { renderToNodeStream } from '@vue/server-renderer'
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
  'locale',
  'routeParams',
  'errorWhileRendering',
  'config',
]

function onBeforeRender(pageContext: PageContext) {
  // during runtime, inject env variables from server
  const config: Config = {
    mediaUrl: process.env.MEDIA_URL ?? '',
    cubeUrl: process.env.CUBE_URL ?? '',
    managerUrl: process.env.MANAGER_URL ?? '',
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
  const { app, head, queryClient } = await createApp(pageContext)

  const stream = await renderToNodeStream(app)
  const waitUntilNotFetching = () => new Promise(resolve => {
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      const countFetching = queryClient.isFetching()
      if (countFetching == 0) {
        unsubscribe()
        resolve(undefined)
      }
    })
  })
  if (queryClient.isFetching() > 0) {
    await waitUntilNotFetching()
  }
  const vueQueryState = dehydrate(queryClient)

  const payload = await renderSSRHead(head)

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html${dangerouslySkipEscape(payload.htmlAttrs)}>
      <head>
        ${dangerouslySkipEscape(payload.headTags)}
      </head>
      <body${dangerouslySkipEscape(payload.bodyAttrs)}>
        ${dangerouslySkipEscape(payload.bodyTagsOpen)}
        <div id="app">${stream}</div>
        ${dangerouslySkipEscape(payload.bodyTags)}
      </body>
    </html>`

  return {
    documentHtml,
    pageContext: {
      //enableEagerStreaming: true,
      vueQueryState,
    },
  }
}
