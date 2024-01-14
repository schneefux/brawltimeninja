import { renderToString } from '@vue/server-renderer'
import { dangerouslySkipEscape, escapeInject } from 'vike/server'
import { createApp } from './app'
import type { PageContext } from './types'
import type { PageContextBuiltInServer } from 'vike/types'
import { dehydrate } from '@tanstack/vue-query'
import { renderSSRHead } from '@unhead/ssr'
import SuperJSON from 'superjson'
import { render } from 'vike/abort'

export { onRenderHtml }

async function onRenderHtml(pageContext: PageContextBuiltInServer & PageContext) {
  const { app, head, pinia, router, queryClient } = createApp(pageContext)

  try {
    let firstError: unknown = undefined
    app.config.errorHandler = (err) => {
      firstError = firstError ?? err
      return false
    }

    await router.push(pageContext.urlOriginal)
    await router.isReady()

    let string = await renderToString(app)

    if (firstError) {
      throw firstError
    }
    if (pageContext.abortStatusCode != undefined) {
      throw render(pageContext.abortStatusCode, pageContext.abortReason)
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
  } finally {
    // queryClient.cancelQueries() // TODO: cancel queries after timeout
    // TODO to do that, implement abort signal inside useAsync and cube queries, currently this is a no-op
    // (challenging - cubejs is not designed to abort queries)

    // trigger garbage collection
    queryClient.clear()
  }
}
