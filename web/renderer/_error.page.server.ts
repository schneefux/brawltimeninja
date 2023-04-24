import { renderToString } from '@vue/server-renderer'
import { dangerouslySkipEscape, escapeInject } from 'vite-plugin-ssr/server'
import { createApp } from './error-app'
import type { PageContext } from './types'
import type { PageContextBuiltIn } from 'vite-plugin-ssr/types'
import { renderSSRHead } from '@unhead/ssr'

export { passToClient }
export { render }

const passToClient = [
  'errorWhileRendering',
  'errorMessage',
  'statusCode',
]

async function render(pageContext: PageContextBuiltIn & PageContext) {
  const { app, head } = createApp(pageContext)

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
