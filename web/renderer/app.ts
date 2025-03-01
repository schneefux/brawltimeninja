import { createSSRApp, markRaw, reactive } from 'vue'
import { QueryCache, QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import KlickerPlugin, { createClient as createKlickerClient } from '~/plugins/klicker'
import TRPCPlugin, { createClient as createTrpcClient } from '~/plugins/trpc'
import type { PageContext } from './types'
import { setPageContext } from '../composables/page-context'
import { createPinia } from 'pinia'
import VueGtagPlugin, { query } from 'vue-gtag'
import { createI18n, I18n } from 'vue-i18n'
import { ClientOnly } from '@schneefux/klicker/components'
import { createHead } from '@unhead/vue'
import { InferSeoMetaPlugin } from '@unhead/addons'
import { defaultLocale, locales } from '~/locales'
import { createRouter } from './router'
import { localePath, useSentry } from '~/composables/compat'

export { createApp }

export type AppI18n = I18n<{}, {}, {}, string, false>['global']

declare module 'vue' {
  interface ComponentCustomProperties {
    localePath: (path: string) => string
  }
}

declare module 'pinia' {
  export interface PiniaCustomProperties<Id, S, G, A> {
    api: ReturnType<typeof createTrpcClient>
    klicker: ReturnType<typeof createKlickerClient>
  }
}

function createApp(pageContext: PageContext, customFetch: typeof fetch) {
  const { Page } = pageContext

  const app = createSSRApp(Page)

  if (import.meta.env.DEV) {
    app.config.performance = true
  }

  setPageContext(app, reactive(pageContext))

  const i18n = createI18n({
    legacy: false,
    locale: defaultLocale.iso, // set by router
    fallbackLocale: defaultLocale.iso,
    availableLocales: locales.map(l => l.iso),
    messages: {} as Record<string, Record<string, string>>,
  })
  app.use(i18n)

  const themeColor = '#facc15' // yellow-400
  const head = createHead({
    plugins: [
      InferSeoMetaPlugin(),
    ],
  })
  head.push({
    titleTemplate: (title) => title != undefined ? `${title} - Brawl Time Ninja` : 'Brawl Time Ninja',
    bodyAttrs: {
      class: ['dark'],
    },
    script: [
      // vite-plugin-pwa cannot modify the HTML, manually add SW and manifest
      // https://github.com/brillout/vite-plugin-ssr/issues/295
      {
        innerHTML: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js', { scope: '/' }) }) }`,
      },
    ],
    link: [
      { rel: 'manifest', href: '/manifest.webmanifest' }, // TODO try https://vite-pwa-org.netlify.app/frameworks/#accessing-pwa-info instead
      { rel: 'icon', href: '/icons/favicon.ico', sizes: 'any' },
      { rel: 'icon', href: '/icons/favicon.svg', type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: '/icons/icon_x512.png', sizes: '512x512' },
      { rel: 'shortcut-icon', href: '/icons/maskable_icon_x48.png' },
      { rel: 'preconnect', href: pageContext.envConfig.cubeUrl },
      { rel: 'preconnect', href: pageContext.envConfig.mediaUrl },
    ],
    meta: [
      { name: 'theme-color', content: themeColor },
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
  })
  app.use(head)

  const router = createRouter(i18n.global, pageContext, head, pageContext.envConfig)
  app.use(router)

  const klickerOptions = {
    cubeUrl: pageContext.envConfig.cubeUrl,
    managerUrl: pageContext.envConfig.managerUrl,
    translate: i18n.global.t,
    tokenProvider: async () => {
      const api = createTrpcClient(trpcOptions.serverOptions)
      return await api.auth.getToken.mutate()
    },
    fetch: customFetch,
    router,
  }
  app.use(KlickerPlugin, klickerOptions)

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // reuse data without firing a new request if it is less than 5 minutes old
        refetchInterval: 1000 * 60 * 5, // refetch data every 5 minutes
        // keep data for 5min
        // during SSR, gc is performed manually after hydration, otherwise it will slowly leak memory
        // (not sure why - probably tanstack-query bug, might be related to an unclean render exit when an exception is thrown)
        gcTime: 1000 * 60 * 5,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
    },
    queryCache: new QueryCache({
      onError(err) {
        app.runWithContext(() => {
          const sentry = useSentry()
          sentry?.captureException(err)
        })
      },
    })
  })
  app.use(VueQueryPlugin, { queryClient })

  const trpcOptions = {
    serverOptions: import.meta.env.SSR ? {
      host: pageContext.server.host,
      port: pageContext.server.port,
      requestHeaders: pageContext.server.requestHeaders,
    } : undefined,
  }
  app.use(TRPCPlugin, trpcOptions)

  const pinia = createPinia()
  pinia.use(({ store }) => {
    store.api = markRaw(createTrpcClient(trpcOptions.serverOptions))
    store.klicker = markRaw(createKlickerClient(klickerOptions))
  })
  app.use(pinia)

  app.component('ClientOnly', ClientOnly)

  app.config.globalProperties.localePath = (path: string) => localePath(path, i18n.global)

  app.use(VueGtagPlugin, {
    config: {
      id: pageContext.envConfig.ga4Id,
    },
    onReady() {
      query('js', new Date())
    },
  }, router)

  return {
    app,
    head,
    pinia,
    router,
    queryClient,
  }
}
