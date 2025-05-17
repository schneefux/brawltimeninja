import { defaultLocale, loadLocaleWithFallback, locales } from '~/locales'
import { VueHeadClient } from '@unhead/vue'
import { createMemoryHistory, createRouter as _createRouter, createWebHistory, RouteRecordRaw, RouteLocationNormalized } from 'vue-router'
// @ts-ignore
import routes from '~pages'
import { AppI18n } from './app'
import { PageContext } from './types'
import { getPathWithLocale, getSelfOrigin } from '~/composables/compat'
import { Config } from '~/config/config'

export { createRouter }

function createRouter(i18n: AppI18n, pageContext: PageContext, head: VueHeadClient, config: Config) {
  const origin = getSelfOrigin(pageContext)

  const updateLocale = async (locale: typeof locales[0], to: RouteLocationNormalized) => {
    const fallbackLocale = locales.find(l => l.iso == i18n.fallbackLocale.value)!

    head.push({
      htmlAttrs: {
        lang: locale.iso,
      },
      link: [
        {
          rel: 'canonical',
          href: origin + (to.path == '/' ? '' : to.path), // without queries and hash
        },
        {
          rel: 'alternate',
          href: origin + getPathWithLocale(to.fullPath, fallbackLocale, fallbackLocale),
          hreflang: 'x-default',
        },
        ...locales.filter(l => l.show).map(l => ({
          rel: 'alternate',
          href: origin + getPathWithLocale(to.fullPath, l, fallbackLocale),
          hreflang: l.iso,
        })),
      ],
      meta: [
        { property: 'og:url', content: origin + to.fullPath },
        { property: 'og:locale', content: locale.iso },
        ...locales.filter(l => l.show && l.iso != locale.iso).map(l => ({
          property: 'og:locale:alternate',
          content: l.iso,
        })),
      ],
    })

    if (pageContext.localeMessages == undefined) {
      pageContext.localeMessages = {}
    }

    if (!i18n.availableLocales.includes(locale.iso)) {
      const fallbackLocale = locales.find(l => l.iso == i18n.fallbackLocale.value)!
      pageContext.localeMessages[locale.iso] = pageContext.localeMessages[locale.iso]
        ?? await loadLocaleWithFallback(locale, fallbackLocale, config)
      i18n.setLocaleMessage(locale.iso, pageContext.localeMessages[locale.iso]!)
    }

    i18n.locale.value = locale.iso
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
      await updateLocale(l, to)
    },
  } satisfies RouteRecordRaw)

  const localizeRoutes = (routes: any[]) => routes.flatMap((r: any) => locales.map(l => localizeRoute(r, l)))

  return _createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes: localizeRoutes(routes),
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      }

      if (to.path == from.path) {
        return
      }

      return { top: 0 }
    },
  })
}
