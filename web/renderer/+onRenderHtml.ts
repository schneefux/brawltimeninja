import { renderToString } from '@vue/server-renderer'
import { dangerouslySkipEscape, escapeInject } from 'vike/server'
import { createApp } from './app'
import type { PageContext } from './types'
import type { PageContextServer } from 'vike/types'
import { dehydrate } from '@tanstack/vue-query'
import { renderSSRHead } from '@unhead/ssr'
import SuperJSON from 'superjson'
import { render } from 'vike/abort'
import { SentryInjectionKey } from './sentry'
import customFetch from '~/lib/fetch'

export { onRenderHtml }

async function onRenderHtml(pageContext: PageContextServer & PageContext) {
  // dirty cast undici as fetch - see cube.js source code, that's fine
  const { app, head, pinia, router, queryClient } = createApp(pageContext, customFetch as any)

  app.provide(SentryInjectionKey, pageContext.sentry as any)

  try {
    let firstError: unknown = undefined
    app.config.errorHandler = (err) => {
      firstError = firstError ?? err
      pageContext.sentry.captureException(err)
      return false
    }

    let string: string

    // FIXME rethink usage of abortStatusCode
    if (pageContext.abortReason == undefined && pageContext.abortStatusCode == undefined) {
      // render regular page
      await router.push(pageContext.urlOriginal)
      await router.isReady()

      string = await renderToString(app)

      if (firstError) {
        throw firstError
      }
      if (pageContext.abortStatusCode != undefined) {
        throw render(pageContext.abortStatusCode, pageContext.abortReason)
      }
    } else {
      // render error page
      string = await renderToString(app)

      if (firstError) {
        throw firstError
      }
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
