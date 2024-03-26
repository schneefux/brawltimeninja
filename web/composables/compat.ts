import { computed, ComputedRef, inject, onMounted, onServerPrefetch, Ref, toRef, unref } from "vue"
import { useQuery, keepPreviousData } from "@tanstack/vue-query";
import { useI18n } from 'vue-i18n'
import { usePageContext } from '~/composables/page-context'
import { TrpcInjectionKey } from "~/plugins/trpc"
import { useHead, ReactiveHead } from "@unhead/vue"
import { LocaleCode, locales } from "~/locales";
import { MaybeRef } from "@vueuse/shared";
import Cookies from 'js-cookie'
import { onBeforeRouteLeave, onBeforeRouteUpdate, RouteLocationNormalized, useRoute, useRouter } from "vue-router";
import { AppI18n } from "~/renderer/app";
import { Locale } from '~/locales';
import { SentryInjectionKey } from "~/renderer/sentry";
import { PageContext } from "~/renderer/types";

/*
 * Nuxt 2 backwards compatibility composables
 */

type ErrorStatusCode = 401 | 403 | 404 | 410 | 429 | 500 | 503
type RedirectStatusCode = 301 | 302

export function useAsync<T>(fun: () => Promise<T>, key: ComputedRef<string>|MaybeRef<string>): Ref<T|undefined> {
  const { suspense, data } = useQuery({
    queryKey: [key],
    queryFn: fun,
    placeholderData: keepPreviousData,
  })
  // FIXME workaround for https://github.com/TanStack/query/issues/6606
  onServerPrefetch(() => suspense().catch(() => {}))
  return data
}

export async function useBlockingAsync<T>(fun: (ctx: ValidateContext) => Promise<T|undefined>, key: MaybeRef<string>, blockOnClient: boolean = true) {
  const r = ssrRef<T|undefined>(undefined, key)

  const promise = useValidate(async ctx => {
    const result = await fun(ctx)
    r.value = result
    return r.value != undefined
  })

  if (import.meta.env.SSR || blockOnClient) {
    await promise
  }

  return r satisfies Ref<T|undefined>
}

export async function useServerBlockingAsync<T>(fun: (ctx: ValidateContext) => Promise<T|undefined>, key: MaybeRef<string>) {
  return useBlockingAsync(fun, key, false)
}

export function ssrRef<T>(defaultValue: T|undefined, key: MaybeRef<string>) {
  const pageContext = usePageContext()
  const r = toRef(pageContext.refs, unref(key)) as Ref<T|undefined>
  if (r.value == undefined) {
    r.value = defaultValue
  }
  return r
}

/** prepend locale */
export function localePath(path: string, i18n: AppI18n) {
  if (i18n.locale.value == i18n.fallbackLocale.value) {
    return path
  }
  return `/${i18n.locale.value}${path}`
}

export function useLocalePath() {
  const i18n = useI18n()
  return (path: string) => localePath(path, i18n)
}

export function useApi() {
  const $api = inject(TrpcInjectionKey)!
  return $api
}

export function useConfig() {
  const pageContext = usePageContext()
  return pageContext.envConfig
}

const i18nCookieName = 'i18n_redirected'
export function useSwitchToLocale() {
  const router = useRouter()
  const route = useRoute()
  const i18n = useI18n()

  const switchToLocale = async (locale: Locale, userInitiated: boolean = false) => {
    if (userInitiated) {
      Cookies.set(i18nCookieName, locale.code)
    }

    const findLocale = (localeIso: string) => locales.find(l => l.iso == localeIso)!
    const newPath = getPathWithLocale(route.fullPath, locale, findLocale(i18n.fallbackLocale.value as string))
    await router.push(newPath)
  }

  const filteredLocales = locales.filter(l => l.show)

  return {
    locales: filteredLocales,
    switchToLocale,
  }
}

export function useLocaleCookieRedirect() {
  const { switchToLocale, locales } = useSwitchToLocale()
  const i18n = useI18n()
  const route = useRoute()

  onMounted(() => {
    if (route.path != '/') {
      return
    }

    const userLanguage = navigator.languages[0] ?? navigator.language

    const cookieLocale = locales.find(l => Cookies.get(i18nCookieName) == l.code)
    const userLocale = locales.find(l => userLanguage.startsWith(l.iso))

    const locale = cookieLocale ?? userLocale
    if (locale != undefined && locale.iso != i18n.locale.value) {
      switchToLocale(locale)
    }
  })
}

export function useMeta(fun: () => ReactiveHead) {
  const meta = computed(fun)
  useHead(meta)
}
interface ValidateContext {
  params: Record<string, string|string[]>
  redirect: (status: RedirectStatusCode, url: string) => void
  error: (e: { statusCode: ErrorStatusCode, message: string }) => void
}
export async function useValidate(cb: (context: ValidateContext) => Promise<boolean|undefined>) {
  const pageContext = usePageContext()
  const router = useRouter()
  const route = useRoute()

  async function runValidate(route: RouteLocationNormalized) {
    if (pageContext.validated) {
      return
    }

    pageContext.validated = true

    const error = async (e: { statusCode: ErrorStatusCode, message: string }) => {
      pageContext.abortReason = e.message
      pageContext.abortStatusCode = e.statusCode
      await router.replace({
        name: 'error',
        params: { pathMatch: route.path.substring(1).split('/') },
        query: route.query,
        hash: route.hash,
      })
    }
    const redirect = async (status: RedirectStatusCode, url: string) => {
      pageContext.statusCode = status
      pageContext.redirectTo = url
      await router.replace(url)
    }

    const context: ValidateContext = { params: route.params, redirect, error }
    const isValid = await cb(context)

    if (isValid === false) {
      await error({ statusCode: 404, message: 'Not found' })
    }
  }

  onBeforeRouteUpdate(async (to) => {
    pageContext.validated = false
    pageContext.statusCode = undefined
    pageContext.redirectTo = undefined
    if (!import.meta.env.SSR) {
      pageContext.abortReason = undefined
      pageContext.abortStatusCode = undefined
    }
    await runValidate(to)
  })
  onBeforeRouteLeave(() => {
    pageContext.validated = false
    pageContext.statusCode = undefined
    pageContext.redirectTo = undefined
    if (!import.meta.env.SSR) {
      pageContext.abortReason = undefined
      pageContext.abortStatusCode = undefined
    }
  })

  await runValidate(route)
}

function useHeaders(headers: Record<string, string>) {
  const pageContext = usePageContext()
  onServerPrefetch(() => pageContext.responseHeaders = Object.assign({}, pageContext.responseHeaders, headers))
}

export function useCacheHeaders() {
  useHeaders({ 'Cache-Control': 'public, maxage=60, stale-while-revalidate=60, stale-if-error=300' })
}

export function useCspHeaders() {
  const $config = useConfig()
  const allowedOrigins = [$config.mediaUrl, $config.cubeUrl]
  useHeaders({
    'Content-Security-Policy': `default-src 'self' 'unsafe-inline' 'unsafe-eval' ${allowedOrigins.join(' ')}`,
  })
}

export function useSentry() {
  return inject(SentryInjectionKey)!
}

export function getSelfOrigin(pageContext: PageContext) {
  if (import.meta.env.SSR) {
    const host = pageContext.server.requestHeaders['host']
    return `https://${host}`
  }
  return window.location.origin
}

export function useSelfOrigin() {
  if (import.meta.env.SSR) {
    const pageContext = usePageContext()
    return getSelfOrigin(pageContext)
  }
  return window.location.origin
}

/** replace locale in path */
export function getPathWithLocale(fullPath: string, locale: Locale, fallbackLocale: Locale) {
  const urlPaths = fullPath.split('/')
  const firstPath = urlPaths[1] as LocaleCode
  const validCodes = locales.map(l => l.code)
  const urlWithoutLocale = validCodes.includes(firstPath) ? '/' + urlPaths.slice(2).join('/') : fullPath
  return `${locale.iso == fallbackLocale.iso ? '' : '/' + locale.code}` + urlWithoutLocale
}
