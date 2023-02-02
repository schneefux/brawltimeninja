import { defaultLocale, loadLocale, locales } from '@/locales'
import { MergeHead, VueHeadClient } from '@unhead/vue'
import { createMemoryHistory, createRouter as _createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
// @ts-ignore
import routes from '~pages'
import { AppI18n } from './app'
import { Config } from './types'

export { createRouter }

function createRouter(i18n: AppI18n, head: VueHeadClient<MergeHead>, config: Config) {
  const updateLocale = async (locale: typeof locales[0]) => {
    head.push({
      htmlAttrs: {
        lang: locale.iso,
      },
      meta: [
        { property: 'og:locale', content: locale.iso },
        ...(locales.filter(l => l.show && l.code != locale.code).map(l => ({
          property: 'og:locale:alternate',
          content: l.iso,
        }))),
      ],
    })

    const fallbackLocaleCode = i18n.fallbackLocale.value as string
    if (!i18n.availableLocales.includes(fallbackLocaleCode)) {
      const messages = await loadLocale(fallbackLocaleCode, config)
      i18n.setLocaleMessage(fallbackLocaleCode, messages)
    }

    if (!i18n.availableLocales.includes(locale.code)) {
      const messages = await loadLocale(locale.code, config)
      i18n.setLocaleMessage(locale.code, messages)
    }

    i18n.locale.value = locale.code
    return
  }

  // map routes to localized routes
  const localizeRoute = (r: any, l: typeof locales[0], depth = 0) => ({
    ...r,
    // prepend locale code on top level
    path: (depth > 0 || l.code == defaultLocale.code ? '' : '/' + l.code) + r.path,
    // each route needs a unique name
    name: r.name != undefined ? (l.code == defaultLocale.code ? '' : l.code + '-') + r.name : undefined,
    children: r.children?.map((c: any) => localizeRoute(c, l, depth + 1)),
    beforeEnter: async (to, from) => {
      await updateLocale(l)
    },
  } satisfies RouteRecordRaw)

  const localizeRoutes = (routes: any[]) => routes.flatMap((r: any) => locales.map(l => localizeRoute(r, l)))

  return _createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes: localizeRoutes(routes),
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
