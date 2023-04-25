import { createApp } from './app'
import type { PageContext } from './types'
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

async function render(pageContext: PageContext) {
  const params = createApp(pageContext)

  Sentry.init({
    app: params.app,
    dsn: pageContext.envConfig.sentryDsn,
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
    ignoreErrors: [
      // ignore common errors triggered by ads
      'SYNC.JS',
      `Cannot read properties of null (reading 'setTargeting')`,
      'NS_ERROR_NOT_INITIALIZED',
      '[GPT] ',
    ],
  })
  pageContext.sentry = Sentry as any

  hydrate(params.queryClient, pageContext.vueQueryState)
  params.pinia.state.value = SuperJSON.parse(pageContext.piniaState)
  await params.router.isReady()

  const { registerSW } = await import('virtual:pwa-register') // use dynamic import to fetch sw at runtime
  registerSW({
    immediate: true, // reload app when service worker updates
    async onRegisteredSW(swScriptUrl, registration) {
      // delete old caches by previous PWA implementation
      const keys = await caches.keys()
      const oldKeys = keys.filter(key => !key.startsWith('workbox-precache')) // used by vite-plugin-pwa
      await Promise.all(oldKeys.map(key => caches.delete(key)))
    },
    onRegisterError(error) {
      Sentry.captureException(error)
    },
  })
  params.app.mount('#app')
}
