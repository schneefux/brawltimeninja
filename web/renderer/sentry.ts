import { App, InjectionKey } from "vue"
import { Router } from "vue-router"
import * as Sentry from '@sentry/vue'
import { SENTRY_APPLICATION_KEY } from "~/config/sentry"

export const SentryInjectionKey = Symbol('sentry') as InjectionKey<typeof Sentry>

export function initSentry(dsn: string, app: App<Element>, router?: Router) {
  Sentry.init({
    app,
    dsn,
    debug: import.meta.env.DEV,
    integrations: [
      Sentry.extraErrorDataIntegration(),
      Sentry.reportingObserverIntegration(),
      Sentry.rewriteFramesIntegration(),
      Sentry.httpClientIntegration(),
      Sentry.browserTracingIntegration({
        router,
        enableInp: true,
      }),
      Sentry.browserProfilingIntegration(),
      Sentry.browserSessionIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        maskAllInputs: false,
        blockAllMedia: false,
      }),
      Sentry.thirdPartyErrorFilterIntegration({
        filterKeys: [SENTRY_APPLICATION_KEY],
        behaviour: 'drop-error-if-exclusively-contains-third-party-frames',
      }),
      Sentry.vueIntegration({
        tracingOptions: {
          trackComponents: true,
        },
      })
    ],
    ignoreErrors: [
      // ignore errors triggered by ads
      'fun-hooks: hooked function not ready',
      'The play() request was interrupted',
      "undefined is not an object (evaluating 'window.conversant.launch')",
      // ignore errors that are not actionable
      'Non-Error promise rejection captured with value: undefined',
      'ReportingObserver [deprecation]',
      'Already on path:',
      'Unable to preload CSS',
    ],
    allowUrls: [/https?:\/\/brawltime\.ninja/],
    replaysSessionSampleRate: 0.0001,
    replaysOnErrorSampleRate: 0.002,
    tracePropagationTargets: ['localhost', /^https?:\/\/brawltime\.ninja/],
    tracesSampleRate: 0.01,
    profilesSampleRate: 0.25, // relative to tracesSampleRate
    trackComponents: true,
    beforeSend(event, hint) {
      const error = hint.originalException as any

      if (error && error.name == 'Error' && error.message.length == 0) {
        // cube.js RequestError, ignore
        // FIXME import it from cubejs and match the class
        return null
      }

      if (error == 'Hydration completed but contains mismatches.') {
        // ignore hydration mismatches when the page is auto-translated
        // https://www.ctrl.blog/entry/detect-machine-translated-webpages.html
        const isAutoTranslated = !!document.querySelector('html.translated-ltr, html.translated-rtl, ya-tr-span, *[_msttexthash], *[x-bergamot-translated]')

        if (isAutoTranslated) {
          return null
        }
      }

      // ignore error if user agent contains "Google-Read-Aloud"
      // because this browser does not seem to support service workers
      if (navigator.userAgent.includes('Google-Read-Aloud')) {
        return null
      }

      // ignore errors originating from ad manager script
      if (error && error.stack && error.stack.includes('hb.vntsm.com')) {
        return null
      }

      return event
    },
  })

  app.provide(SentryInjectionKey, Sentry)
}
