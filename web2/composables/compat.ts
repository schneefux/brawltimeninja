import { App, computed, inject, onServerPrefetch, Ref } from "vue"
import { useQuery } from "@tanstack/vue-query";
import { useKlicker } from '@schneefux/klicker/composables'
import { useI18n } from 'vue-i18n'
import { usePageContext } from '~/renderer/usePageContext'
import { navigate } from "vite-plugin-ssr/client/router"
import { BrawltimeKlickerService } from "@/plugins/klicker.service"
import { TrpcInjectionKey } from "@/plugins/trpc"
import { PageContext } from "@/renderer/types"
import { useHead, ReactiveHead } from "@unhead/vue"
import { locales, loadLocale } from "@/locales";
import { extractLocale } from "@/locales/extractLocale";
import { MaybeRef } from "@vueuse/shared";

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

  return {
    $klicker: $klicker as BrawltimeKlickerService,
    $api,
    $supportsWebp: false, // TODO
    $config: {
      mediaUrl: import.meta.env.VITE_MEDIA_URL,
      managerUrl: import.meta.env.VITE_MANAGER_URL,
      renderUrl: import.meta.env.VITE_RENDER_URL,
    }, // TODO
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

export function injectGlobalProperties(app: App, pageContext: PageContext) {
  const $route = computed(() => ({
    path: pageContext.urlPathname,
    fullPath: pageContext.urlOriginal,
  }))
  //app.config.globalProperties.$route = $route as any
  // TODO is not reactive
  app.config.globalProperties.$route = {
    path: pageContext.urlPathname,
    fullPath: pageContext.urlOriginal,
  } as any
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
    replace: (route: Route) => navigate(routeToPath(route), { overwriteLastHistoryEntry: true }),
  }
}

export function useMeta(fun: () => ReactiveHead) {
  const meta = computed(fun)
  useHead(meta)
}
