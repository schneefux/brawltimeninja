import { createSSRApp, markRaw } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import KlickerPlugin, { createClient as createKlickerClient } from '~/plugins/klicker'
import TRPCPlugin, { createClient as createTrpcClient } from '~/plugins/trpc'
import type { PageContext } from './types'
import { setPageContext } from './usePageContext.js'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import VueGtagPlugin from 'vue-gtag'
import { createI18n } from 'vue-i18n'
import { ClientOnly } from '@schneefux/klicker/components'
import Adsense from '~/components/adsense.vue'
import { createHead } from '@unhead/vue'
import { defaultLocale, locales } from '@/locales'
import localeEn from '@/locales/en.json'
import { createRouter } from './router.js'
import { localePath } from '@/composables/compat'

export { createApp }

declare module '@vue/runtime-core' {
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

async function createApp(pageContext: PageContext) {
  const { Page } = pageContext

  const app = createSSRApp(Page)

  setPageContext(app, pageContext)

  const i18n = createI18n({
    legacy: false,
    locale: defaultLocale.code, // set by router
    fallbackLocale: defaultLocale.code,
    availableLocales: locales.map(l => l.code),
    messages: {
      en: localeEn,
    } as Record<string, Record<string, string>>,
  })
  app.use(i18n)

  const themeColor = '#facc15' // yellow-400
  const head = createHead()
  head.push({
    titleTemplate: '%s - Brawl Time Ninja',
    bodyAttrs: {
      class: ['dark'],
    },
    script: [
      {
        src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pageContext.config.adsensePubid}`,
        async: true,
        crossorigin: 'anonymous',
      },
      {
        innerHTML: '(adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1;',
        async: false,
      },
      // vite-plugin-pwa cannot modify the HTML, manually add SW and manifest
      // https://github.com/brillout/vite-plugin-ssr/issues/295
      { src: '/registerSW.js' },
    ],
    link: [
      { rel: 'manifest', href: '/manifest.webmanifest' },
      { rel: 'icon', href: '/icons/favicon.ico', sizes: 'any' },
      { rel: 'icon', href: '/icons/favicon.svg', type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: '/icons/icon_x512.png', sizes: '512x512' },
      { rel: 'shortcut-icon', href: '/icons/maskable_icon_x48.png' },
      ...(locales.map(l => ({
        rel: 'alternate',
        href: l.code == 'en' ? '/' : `/${l.code}`,
        hreflang: l.iso,
      }))),
    ],
    meta: [
      { name: 'theme-color', content: themeColor },
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width' },
    ],
  })
  app.use(head)

  const router = createRouter(i18n, pageContext.config.mediaUrl, head)
  app.use(router)

  const klickerOptions = {
    cubeUrl: pageContext.config.cubeUrl,
    managerUrl: pageContext.config.managerUrl,
    translate: i18n.global.t,
    router,
  }
  app.use(KlickerPlugin, klickerOptions)

  // TODO share cache between requests to the same URL?
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  })
  app.use(VueQueryPlugin, { queryClient })

  const pinia = createPinia()
  if (!import.meta.env.SSR) {
    pinia.use(createPersistedState({
      storage: localStorage,
    }))
  }
  pinia.use(({ store }) => {
    store.api = markRaw(createTrpcClient())
    store.klicker = markRaw(createKlickerClient(klickerOptions))
  })
  app.use(pinia)

  app.use(TRPCPlugin)

  app.component('ClientOnly', ClientOnly)
  app.component('Adsense', Adsense)

  app.config.globalProperties.localePath = (path: string) => localePath(path, i18n.global)

  const gtagParams = {
    optimize_id: pageContext.config.optimizeId,
    custom_map: {
      'dimension1': 'branch',
      'dimension2': 'ads_blocked',
      'dimension3': 'is_pwa',
      'dimension4': 'is_twa',
      'dimension5': 'test_group',
    },
  }
  app.use(VueGtagPlugin, {
    enabled: false, // defer until localstorage is loaded in layouts/default.vue
    config: {
      id: pageContext.config.ga4Id,
      params: gtagParams,
    },
    includes: [ {
      // old property
      id: pageContext.config.uaId,
      params: gtagParams,
    } ],
  }, router)

  return {
    app,
    head,
    pinia,
    router,
    queryClient,
  }
}
