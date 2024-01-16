import { App, InjectionKey } from "vue"
import { Router } from "vue-router"
import * as Sentry from '@sentry/vue'
import {
  HttpClient as HttpClientIntegration,
  CaptureConsole as CaptureConsoleIntegration,
  ExtraErrorData as ExtraErrorDataIntegration,
  ReportingObserver as ReportingObserverIntegration,
  RewriteFrames as RewriteFramesIntegration,
} from '@sentry/integrations'
import { Feedback } from '@sentry-internal/feedback'

export const SentryInjectionKey = Symbol('sentry') as InjectionKey<typeof Sentry>

export function initSentry(dsn: string, app: App<Element>, router?: Router) {
  Sentry.init({
    app,
    dsn,
    debug: import.meta.env.DEV,
    autoSessionTracking: true,
    integrations: [
      new ExtraErrorDataIntegration(),
      new ReportingObserverIntegration(),
      new RewriteFramesIntegration(),
      new CaptureConsoleIntegration({
        levels: ['error', 'assert']
      }),
      new HttpClientIntegration(),
      new Sentry.BrowserTracing({
        routingInstrumentation: router != undefined ? Sentry.vueRouterInstrumentation(router) : undefined,
        tracePropagationTargets: ['localhost', /^https?:\/\/brawltime\.ninja/],
      }),
      new Sentry.BrowserProfilingIntegration(),
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
    replaysOnErrorSampleRate: 0.1,
    tracesSampleRate: 0.01,
    profilesSampleRate: 0.25, // relative to tracesSampleRate
  })

  app.provide(SentryInjectionKey, Sentry)
}
