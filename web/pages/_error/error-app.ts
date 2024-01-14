import { createSSRApp } from 'vue'
import type { PageContext } from '../../renderer/types'
import { setPageContext } from '../../composables/page-context'
import { createHead } from '@unhead/vue'
import { ClientOnly } from '@schneefux/klicker/components'
import { createI18n } from 'vue-i18n'
import { defaultLocale, loadLocaleWithFallback } from '~/locales'
import en from '~/locales/en.json'

export { createApp }

function createApp(pageContext: PageContext) {
  const { Page } = pageContext

  const app = createSSRApp(Page)

  setPageContext(app, pageContext)

  const i18n = createI18n({
    legacy: false,
    locale: defaultLocale.iso,
    fallbackLocale: defaultLocale.iso,
    availableLocales: [defaultLocale.iso],
    messages: { en }
  })
  app.use(i18n)

  const themeColor = '#facc15' // yellow-400
  const head = createHead()
  head.push({
    title: 'Error - Brawl Time Ninja',
    bodyAttrs: {
      class: ['dark'],
    },
    link: [
      { rel: 'icon', href: '/icons/favicon.ico', sizes: 'any' },
      { rel: 'icon', href: '/icons/favicon.svg', type: 'image/svg+xml' },
    ],
    meta: [
      { name: 'theme-color', content: themeColor },
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
  })
  app.use(head)

  app.component('ClientOnly', ClientOnly)

  return {
    app,
    head,
  }
}
