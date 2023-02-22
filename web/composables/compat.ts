import { computed, inject, onServerPrefetch, Ref, toRef, watch } from "vue"
import { useQuery } from "@tanstack/vue-query";
import { useI18n } from 'vue-i18n'
import { usePageContext } from '~/renderer/usePageContext'
import { TrpcInjectionKey } from "@/plugins/trpc"
import { useHead, ReactiveHead } from "@unhead/vue"
import { locales } from "@/locales";
import { MaybeRef } from "@vueuse/shared";
import Cookies from 'js-cookie'
import { onBeforeRouteLeave, onBeforeRouteUpdate, RouteLocationNormalized, useRoute, useRouter } from "vue-router";
import { AppI18n } from "@/renderer/app";
import { Locale } from '~/locales';

/*
 * Nuxt 2 backwards compatibility composables
 */

export function useAsync<T>(fun: () => Promise<T>, key: MaybeRef<string>): Ref<T|undefined> {
  const sentry = useSentry()
  const { suspense, data } = useQuery([key], fun, {
    keepPreviousData: true,
    onError(err) {
      sentry.captureException(err)
    },
  })
  onServerPrefetch(suspense)
  return data
}

export async function useBlockingAsync<T>(fun: (ctx: ValidateContext) => Promise<T|undefined>, key: string): Promise<Ref<T>> {
  const r = ssrRef<T|undefined>(undefined, key)

  await useValidate(async ctx => {
    const result = await fun(ctx)
    r.value = result
    return r.value != undefined
  })

  return r as Ref<T>
}

export function ssrRef<T>(defaultValue: T|undefined, key: string) {
  const pageContext = usePageContext()
  const r = toRef(pageContext.refs, key) as Ref<T|undefined>
  if (r.value == undefined) {
    r.value = defaultValue
  }
  return r
}

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
  return pageContext.config
}

const i18nCookieName = 'i18n_redirected'
export function useSwitchToLocale() {
  const route = useRoute()
  const router = useRouter()
  const i18n = useI18n()

  const switchToLocale = (locale: Locale, userInitiated: boolean = false) => {
    if (userInitiated) {
      Cookies.set(i18nCookieName, locale.code)
    }

    const urlPaths = route.fullPath.split('/')
    const firstPath = urlPaths[1]
    const currentCode = locales.find(l => l.iso == i18n.locale.value)!.code
    const urlWithoutLocale = (firstPath == currentCode) ? '/' + urlPaths.slice(2).join('/') : route.fullPath
    const newPath = `${locale.iso == i18n.fallbackLocale.value ? '' : '/' + locale.code}` + urlWithoutLocale
    router.push(newPath)
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

  if (route.fullPath == '/' && !import.meta.env.SSR) {
    const userLanguage = navigator.languages[0] ?? navigator.language

    const cookieLocale = locales.find(l => Cookies.get(i18nCookieName) == l.code)
    const userLocale = locales.find(l => userLanguage.startsWith(l.iso))

    const locale = cookieLocale ?? userLocale
    if (locale != undefined && locale.iso != i18n.locale.value) {
      switchToLocale(locale)
    }
  }
}

export function useMeta(fun: () => ReactiveHead) {
  const meta = computed(fun)
  useHead(meta)
}
// see https://github.com/brillout/vite-plugin-ssr/blob/main/vite-plugin-ssr/node/runtime/renderPage/RenderErrorPage.ts
function RenderErrorPage({ pageContext }: { pageContext?: Record<string, unknown> } = {}) {
  const err = new Error('RenderErrorPage')
  Object.assign(err, { pageContext, '__isRenderErrorPageException': true })
  return err
}
interface ValidateContext {
  params: Record<string, string|string[]>
  redirect: (status: number, url: string) => void
  error: (e: { statusCode: number, message: string }) => void
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

    const error = (e: { statusCode: number, message: string }) => {
      if (import.meta.env.SSR) {
        throw RenderErrorPage({
          pageContext: {
            statusCode: e.statusCode,
            errorMessage: e.message,
          },
        })
      } else {
        router.replace({
          name: 'error',
          params: { pathMatch: route.path.substring(1).split('/') },
          query: route.query,
          hash: route.hash,
        })
      }
    }
    const redirect = (status: number, url: string) => {
      if (import.meta.env.SSR) {
        pageContext.statusCode = status
        pageContext.redirectTo = url
      } else {
        router.replace(url)
      }
    }

    const context: ValidateContext = { params: route.params, redirect, error }
    const isValid = await cb(context)

    if (isValid === false) {
      error({ statusCode: 404, message: 'Not found' })
    }
  }

  onBeforeRouteUpdate(async (to) => {
    pageContext.validated = false
    pageContext.statusCode = undefined
    pageContext.redirectTo = undefined
    await runValidate(to)
  })
  onBeforeRouteLeave(() => {
    pageContext.validated = false
    pageContext.statusCode = undefined
    pageContext.redirectTo = undefined
  })

  await runValidate(route)
}

function useHeaders(headers: Record<string, string>) {
  const pageContext = usePageContext()
  onServerPrefetch(() => pageContext.responseHeaders = Object.assign({}, pageContext.responseHeaders, headers))
}

export function useCacheHeaders() {
  useHeaders({ 'Cache-Control': 'public, maxage=60' })
}

export function useCspHeaders() {
  const $config = useConfig()
  const allowedOrigins = [$config.mediaUrl, $config.cubeUrl]
  useHeaders({
    'Content-Security-Policy': `default-src 'self' 'unsafe-inline' 'unsafe-eval' ${allowedOrigins.join(' ')}`,
  })
}

export function useSentry() {
  const pageContext = usePageContext()
  return pageContext.sentry
}

export function useSelfOrigin() {
  if (import.meta.env.SSR) {
    const pageContext = usePageContext()
    const host = pageContext.server.requestHeaders['host']
    return `https://${host}`
  }
  return window.location.origin
}
