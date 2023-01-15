import { computed, inject, onMounted, onServerPrefetch, ref, Ref, watch } from "vue"
import { useQuery } from "@tanstack/vue-query";
import { useKlicker } from '@schneefux/klicker/composables'
import { useI18n } from 'vue-i18n'
import { usePageContext } from '~/renderer/usePageContext'
import { navigate } from "vite-plugin-ssr/client/router"
import { BrawltimeKlickerService } from "@/plugins/klicker.service"
import { TrpcInjectionKey } from "@/plugins/trpc"
import { useHead, ReactiveHead } from "@unhead/vue"
import { locales, loadLocale } from "@/locales";
import { extractLocale } from "@/locales/extractLocale";
import { MaybeRef } from "@vueuse/shared";
import Cookies from 'js-cookie'

/*
 * Nuxt 2 backwards compatibility composables
 */

export function useAsync<T>(fun: () => Promise<T>, key: MaybeRef<string>): Ref<T|undefined> {
  const { suspense, data } = useQuery([key], fun)
  onServerPrefetch(suspense)
  return data
}

export function useContext() {
  const $klicker = useKlicker()
  const $api = inject(TrpcInjectionKey)!
  const i18n = useI18n()
  const pageContext = usePageContext()

  return {
    $klicker: $klicker as BrawltimeKlickerService,
    $api,
    $supportsWebp: false, // TODO
    $config: pageContext.config,
    $http: {} as any, // TODO
    i18n: {
      ...i18n,
      tc: i18n.t,
    },
    error: (e: { statusCode: number, message: string }) => {}, // TODO
    $sentry: {
      captureException: (e: any) => {}, // TODO
    },
  }
}

export function useSwitchToLocale() {
  const i18n = useI18n()
  const { $config } = useContext()
  const pageContext = usePageContext()

  const switchToLocale = async (code: string) => {
    if (i18n.locale.value == code) {
      return
    }

    if (!i18n.availableLocales.includes(code)) {
      const messages = await loadLocale($config.mediaUrl, code)
      i18n.setLocaleMessage(code, messages)
    }

    i18n.locale.value = code

    const oldUrl = extractLocale(pageContext.urlOriginal)
    const newUrl = code == i18n.fallbackLocale.value ? oldUrl.urlWithoutLocale : '/' + code + oldUrl.urlWithoutLocale
    navigate(newUrl, { keepScrollPosition: true })
  }

  return { locales, switchToLocale }
}

export function useLocaleCookieRedirect() {
  const { switchToLocale, locales } = useSwitchToLocale()
  const i18n = useI18n()
  const route = useRoute()

  const i18nCookieName = 'i18n_redirected'
  if (route.value.fullPath == '/' && !import.meta.env.SSR) {
    const userLanguage = navigator.languages[0] ?? navigator.language
    const userLocaleCode = locales.find(l => userLanguage.startsWith(l.iso))?.code
    const cookieLocaleCode = Cookies.get(i18nCookieName)
    const localeCode = cookieLocaleCode ?? userLocaleCode ?? 'en'
    if (locales.some(l => l.code == localeCode)) {
      switchToLocale(localeCode!)
    }
  }

  watch(i18n.locale, () => Cookies.set(i18nCookieName, i18n.locale.value))
}

export function useRoute() {
  const pageContext = usePageContext()!

  return computed(() => ({
    path: pageContext.urlPathname,
    fullPath: pageContext.urlOriginal,
    query: pageContext.urlParsed.searchAll,
    params: pageContext.routeParams ?? {},
  }))
}

export type Route = string | {
  path?: string
  query?: Record<string, string[]>
}

export function useRouter() {
  const i18n = useI18n()
  const pageContext = usePageContext()

  /**
   * Prepend locale code
   */
  const localePath = (path: string) => {
    if (pageContext.locale.code === i18n.fallbackLocale.value) {
      return path
    }

    return '/' + pageContext.locale.code + path
  }

  /**
   * Convert a route to a string with the locale code prepended
   */
  const routeToPath = (route: Route) => {
    if (typeof route == 'string') {
      return localePath(route)
    }

    const path = route.path != undefined ? localePath(route.path) : window.location.pathname
    const searchParams = Object.entries(route.query ?? {}).flatMap(([key, values]) => values.map(value => [key, value]))
    return `${path}?${new URLSearchParams(searchParams).toString()}`
  }

  return {
    localePath,
    routeToPath,
    push: (route: Route) => navigate(routeToPath(route)),
    replace: (route: Route) => navigate(routeToPath(route), {
      overwriteLastHistoryEntry: true,
      keepScrollPosition: true,
    }),
  }
}

export function useMeta(fun: () => ReactiveHead) {
  const meta = computed(fun)
  useHead(meta)
}

export function useRedirect() {
  const pageContext = usePageContext()

  return (status: number, url: string) => pageContext.redirectTo = { status, url }
}

export function useValidate(cb: (context: { params: Record<string, string> }) => Promise<boolean>) {
  const pageContext = usePageContext()

  onServerPrefetch(async () => {
    pageContext.validated = true
    const isValid = await cb({ params: pageContext.routeParams ?? {} })
    if (!isValid) {
      pageContext.redirectTo = { status: 404, url: '/404' }
    }
  })

  onMounted(async () => {
    // TODO should block navigation until validation is done
    if (!pageContext.validated) {
      const isValid = await cb({ params: pageContext.routeParams ?? {} })
      if (!isValid) {
        navigate('/404', { overwriteLastHistoryEntry: true })
      }
    }
  })
}
