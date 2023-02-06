import { createApp } from './app'
import type { PageContext } from './types'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client/router'
import { hydrate } from '@tanstack/vue-query'
import SuperJSON from 'superjson'
import * as Sentry from '@sentry/vue'
import {
  HttpClient as HttpClientIntegration,
  CaptureConsole as CaptureConsoleIntegration,
  ExtraErrorData as ExtraErrorDataIntegration,
  ReportingObserver as ReportingObserverIntegration,
  RewriteFrames as RewriteFramesIntegration,
} from '@sentry/integrations'

export { render }

async function render(pageContext: PageContextBuiltInClient & PageContext) {
  const params = createApp(pageContext)

  Sentry.init({
    app: params.app,
    dsn: pageContext.config.sentryDsn,
    debug: import.meta.env.DEV,
    autoSessionTracking: !import.meta.env.SSR,
    integrations: [
      new ExtraErrorDataIntegration(),
      new ReportingObserverIntegration(),
      new RewriteFramesIntegration(),
      new CaptureConsoleIntegration({
        levels: ['error', 'assert']
      }),
      new HttpClientIntegration(),
    ],
  })
  pageContext.sentry = Sentry as any

  hydrate(params.queryClient, pageContext.vueQueryState)
  params.pinia.state.value = SuperJSON.parse(pageContext.piniaState)
  await params.router.isReady()
  params.app.mount('#app')
}
