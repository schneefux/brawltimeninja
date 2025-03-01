import { createApp } from './app'
import type { PageContext } from './types'
import { hydrate } from '@tanstack/vue-query'
import SuperJSON from 'superjson'

// polyfills
import 'core-js/stable/structured-clone' // used by vega-lite
import 'core-js/stable/object/from-entries'
import { SentryInjectionKey, initSentry } from './sentry'
import { inject } from 'vue'

export { onRenderClient }

async function onRenderClient(pageContext: PageContext) {
  // fetch requires window as `this`, so bind it
  const params = createApp(pageContext, window.fetch.bind(window))

  const { registerSW } = await import('virtual:pwa-register') // use dynamic import to fetch sw at runtime
  registerSW({
    immediate: true, // reload app when service worker updates
    onRegisterError(error) {
      params.app.runWithContext(() => {
        const sentry = inject(SentryInjectionKey)
        sentry?.captureException(error)
      })
    },
  })

  initSentry(pageContext.envConfig.sentryDsn, params.app, params.router)
  hydrate(params.queryClient, pageContext.vueQueryState)
  params.pinia.state.value = SuperJSON.parse(pageContext.piniaState)

  await params.router.isReady()

  params.app.mount('#app')
}
