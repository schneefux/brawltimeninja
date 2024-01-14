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

// polyfills
import 'core-js/stable/structured-clone' // used by vega-lite
import 'core-js/stable/object/from-entries'

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
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(params.router),
        tracePropagationTargets: ["localhost", /^https?:\/\/brawltime\.ninja/],
      })
    ],
    ignoreErrors: [
      // ignore common errors triggered by ads
      'ReportingObserver [deprecation]',
      '[GPT] ',
      'SYNC.JS',
      'ox_esp',
      'Tyche blocked',
    ],
    allowUrls: [/https?:\/\/brawltime\.ninja/],
    replaysOnErrorSampleRate: 0.001,
    tracesSampleRate: 0.0001,
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
