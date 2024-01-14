import { renderToString } from '@vue/server-renderer'
import { dangerouslySkipEscape, escapeInject } from 'vike/server'
import { createApp } from './error-app'
import type { PageContext } from '../../renderer/types'
import { renderSSRHead } from '@unhead/ssr'
import { SentryInjectionKey } from '~/renderer/sentry'

export { onRenderHtml }

async function onRenderHtml(pageContext: PageContext) {
  const { app, head } = createApp(pageContext)

  app.provide(SentryInjectionKey, pageContext.sentry as any)

  const string = await renderToString(app)
  const payload = await renderSSRHead(head)

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
  }
}
