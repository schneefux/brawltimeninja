import { loadLocale, locales } from '@/locales'
import { MergeHead, VueHeadClient } from '@unhead/vue'
import { I18n, Locale } from 'vue-i18n'
import { createMemoryHistory, createRouter as _createRouter, createWebHistory } from 'vue-router'
// @ts-ignore
import routes from '~pages'

export { createRouter }

function createRouter(i18n: I18n<{}, {}, {}, Locale, false>, mediaUrl: string, head: VueHeadClient<MergeHead>) {
  const updateLocale = async (localeCode: string) => {
    const locale = locales.find(l => l.code === localeCode)
    if (locale == undefined) {
      return
    }

    head.push({
      htmlAttrs: {
        lang: locale.iso,
      },
      meta: [
        { property: 'og:locale', content: locale.iso },
        ...(locales.filter(l => l.code != locale.code).map(l => ({
          property: 'og:locale:alternate',
          content: l.iso,
        }))),
      ],
    })

    if (!i18n.global.availableLocales.includes(locale.code)) {
      const messages = await loadLocale(mediaUrl, locale.code)
      i18n.global.setLocaleMessage(locale.code, messages)
    }

    i18n.global.locale.value = locale.code
    return
  }

  return _createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes: [{
      path: '/:locale*',
      beforeEnter: async (to, from, next) => {
        await updateLocale(to.params.locale[0])
        return next()
      },
      children: routes,
    }],
    scrollBehavior(to, from, savedPosition) {
      if (to.hash) {
        return {
          el: to.hash,
          behavior: 'smooth',
        }
      }

      if (to.path == from.path) {
        return
      }

      return { top: 0 }
    },
  })
}
