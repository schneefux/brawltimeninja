import { defineComponent, markRaw, h, createSSRApp, reactive } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import KlickerPlugin from '~/plugins/klicker'
import TRPCPlugin from '~/plugins/trpc'
import PageShell from './PageShell.vue'
import type { PageContext } from './types'
import { setPageContext } from './usePageContext.js'
import DefaultLayout from '~/layouts/default.vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import VueGtagPlugin from 'vue-gtag'
import { createI18n } from 'vue-i18n'
import { injectGlobalProperties } from '@/composables/compat'
import RouterLink from '~/components/router-link.vue'
import { ClientOnly } from '@schneefux/klicker/components'
import Adsense from '~/components/adsense.vue'
import { createHead } from '@unhead/vue'
import { defaultLocale, loadLocale, locales } from '@/locales'
import localeEn from '@/locales/en.json'

export { createApp }

async function createApp(pageContext: PageContext) {
  const { Page } = pageContext

  const PageWithWrapper = defineComponent({
    data: () => ({
      Page: markRaw(Page),
      Layout: markRaw(pageContext.exports.Layout || DefaultLayout),
    }),
    created() {
      rootComponent = this
    },
    render() {
      return h(
        PageShell,
        {},
        () => h(this.Layout, () => h(this.Page)),
      )
    },
  })
  let rootComponent: InstanceType<typeof PageWithWrapper>

  const ssrApp = createSSRApp(PageWithWrapper)

  // We use `app.changePage()` to do Client Routing, see `_default.page.client.js`
  const app = Object.assign(ssrApp, {
    changePage: (pageContext: PageContext) => {
      Object.assign(pageContextReactive, pageContext)
      rootComponent.Page = markRaw(pageContext.Page)
      rootComponent.Layout = markRaw(pageContext.exports.Layout || DefaultLayout)
    }
  })

  // When doing Client Routing, we mutate pageContext (see usage of `app.changePage()` in `_default.page.client.js`).
  // We therefore use a reactive pageContext.
  const pageContextReactive = reactive(pageContext)

  // Make `pageContext` accessible from any Vue component
  setPageContext(app, pageContextReactive)

  // TODO context is missing locale when rendering error page
  const locale = pageContext.locale ?? defaultLocale
  const messages = await loadLocale(import.meta.env.VITE_MEDIA_URL, locale.code)

  const i18n = createI18n({
    legacy: false,
    locale: locale.code,
    fallbackLocale: 'en',
    availableLocales: locales.map(l => l.code),
    messages: {
      en: localeEn,
      [locale.code]: messages,
    },
  })
  app.use(i18n)

  app.use(KlickerPlugin, {
    cubeUrl: import.meta.env.VITE_CUBE_URL,
    managerUrl: import.meta.env.VITE_MANAGER_URL,
    translate: i18n.global.t,
  })

  // TODO share cache between requests to the same URL?
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  })
  app.use(VueQueryPlugin, { queryClient })

  // ! not SSRed, no need so far
  const pinia = createPinia()
  if (!import.meta.env.SSR) {
    pinia.use(createPersistedState({
      storage: localStorage,
    }))
  }
  app.use(pinia)

  const gtagParams = {
    optimize_id: import.meta.env.VITE_OPTIMIZE_ID,
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
      id: import.meta.env.VITE_GA4_ID,
      params: gtagParams,
    },
    includes: [ {
      // old property
      id: import.meta.env.VITE_UA_ID,
      params: gtagParams,
    } ],
  })

  app.use(TRPCPlugin)

  const head = createHead()
  head.push({
    titleTemplate: '%s - Brawl Time Ninja',
    htmlAttrs: {
      lang: locale.iso,
    },
    bodyAttrs: {
      class: ['dark'],
    },
    script: [
      {
        src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${import.meta.env.VITE_ADSENSE_PUBID}`,
        async: true,
        crossorigin: 'anonymous',
      },
      {
        innerHTML: '(adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1;',
        async: false,
      },
    ],
    link: [
      { rel: 'icon', href: '/icons/favicon.ico', sizes: 'any' },
      { rel: 'icon', href: '/icons/favicon.svg', type: 'image/svg+xml' },
      ...(locales.map(l => ({
        rel: 'alternate',
        href: l.code == 'en' ? '/' : `/${l.code}`,
        hreflang: l.iso,
      }))),
    ],
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width' },
      { property: 'og:locale', content: locale.iso },
      ...(locales.filter(l => l.code != locale.code).map(l => ({
        property: 'og:locale:alternate',
        content: l.iso,
      }))),
    ],
  })
  app.use(head)

  // backwards compatibility
  injectGlobalProperties(app, pageContext)

  app.component('RouterLink', RouterLink)
  app.component('ClientOnly', ClientOnly)
  app.component('Adsense', Adsense)

  return {
    app,
    head,
    queryClient,
  }
}
