import { defineComponent, markRaw, h, createSSRApp, reactive } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import KlickerPlugin from '~/plugins/klicker'
import TRPCPlugin from '~/plugins/trpc'
import PageShell from './PageShell.vue'
import type { PageContext } from './types'
import { setPageContext } from './usePageContext.js'
import DefaultLayout from '~/layouts/default.vue'
import { createPinia } from 'pinia'
import VueGtagPlugin from 'vue-gtag'
import { createI18n } from 'vue-i18n'
import localeEn from '~/locales/en.json'
import { injectGlobalProperties } from '@/composables/compat'
import RouterLink from '~/components/router-link.vue'
import ClientOnly from '~/components/client-only'
import Adsense from '~/components/adsense.vue'
import { createHead } from '@unhead/vue'

export { createApp }

function createApp(pageContext: PageContext) {
  const { Page } = pageContext

  const PageWithWrapper = defineComponent({
    data: () => ({
      Page: markRaw(Page),
      pageProps: markRaw(pageContext.pageProps || {}),
      Layout: markRaw(pageContext.exports.Layout || DefaultLayout),
    }),
    created() {
      rootComponent = this
    },
    render() {
      return h(
        PageShell,
        {},
        () => h(this.Layout, () => h(this.Page, this.pageProps)),
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
      rootComponent.pageProps = markRaw(pageContext.pageProps || {})
      rootComponent.Layout = markRaw(pageContext.exports.Layout || DefaultLayout)
    }
  })

  // When doing Client Routing, we mutate pageContext (see usage of `app.changePage()` in `_default.page.client.js`).
  // We therefore use a reactive pageContext.
  const pageContextReactive = reactive(pageContext)

  // Make `pageContext` accessible from any Vue component
  setPageContext(app, pageContextReactive)

  app.use(KlickerPlugin, { cubeUrl: 'https://cube.brawltime.ninja', managerUrl: 'https://manager.brawltime.ninja' })

  // TODO share cache between requests to the same URL?
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
      },
    },
  })
  app.use(VueQueryPlugin, { queryClient })

  // ! not SSRed, no need so far
  const pinia = createPinia()
  app.use(pinia)

  const gtagParams = {
    optimize_id: 'OPT-PWZ78LC',
    custom_map: {
      'dimension1': 'branch',
      'dimension2': 'ads_blocked',
      'dimension3': 'is_pwa',
      'dimension4': 'is_twa',
      'dimension5': 'test_group',
    },
  }
  app.use(VueGtagPlugin, {
    config: {
      id: 'G-8GGHZC6QR2',
      params: gtagParams,
    },
    includes: [ {
      // old property
      id: 'UA-137233906-1',
      params: gtagParams,
    } ],
    // toggled in layout.vue
    // TODO
    //enabled: app.store!.state.adsAllowed == true,
  })

  const i18n = createI18n({
    legacy: false,
    // TODO add and load other locales
    locale: 'en',
    fallbackLocale: 'en',
    messages: { en: localeEn },
  })
  app.use(i18n)

  app.use(TRPCPlugin)

  const head = createHead()
  head.push({
    titleTemplate: '%s - Brawl Time Ninja',
    bodyAttrs: {
      class: ['dark'],
    },
    script: [
      {
        src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6856963757796636',
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
    ],
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width' },
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
