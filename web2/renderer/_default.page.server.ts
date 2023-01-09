import { renderToNodeStream } from '@vue/server-renderer'
import { escapeInject } from 'vite-plugin-ssr'
import { createApp } from './app'
import { getPageTitle } from './getPageTitle'
import type { PageContext } from './types'
import type { PageContextBuiltIn } from 'vite-plugin-ssr'
import { dehydrate } from '@tanstack/vue-query'

export { passToClient }
export { render }

const passToClient = ['pageProps', 'documentProps']

async function render(pageContext: PageContextBuiltIn & PageContext) {
  const { app, queryClient } = createApp(pageContext)

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

  const title = getPageTitle(pageContext)

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width" />
        <title>${title}</title>
      </head>
      <body>
        <div id="app" class="dark">${stream}</div>
      </body>
    </html>`

  return {
    documentHtml,
    pageContext: {
      //enableEagerStreaming: true,
      pageProps: {
        vueQueryState,
      },
    },
  }
}
