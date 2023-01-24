import { computed, inject, onServerPrefetch, Ref, watch } from "vue"
import { useQuery } from "@tanstack/vue-query";
import { useKlicker } from '@schneefux/klicker/composables'
import { I18n, Locale, useI18n } from 'vue-i18n'
import { usePageContext } from '~/renderer/usePageContext'
import { BrawltimeKlickerService } from "@/plugins/klicker.service"
import { TrpcInjectionKey } from "@/plugins/trpc"
import { useHead, ReactiveHead } from "@unhead/vue"
import { locales, loadLocale } from "@/locales";
import { MaybeRef } from "@vueuse/shared";
import Cookies from 'js-cookie'
import { onBeforeRouteUpdate, RouteLocationNormalized, useRoute, useRouter } from "vue-router";

/*
 * Nuxt 2 backwards compatibility composables
 */

export function useAsync<T>(fun: () => Promise<T>, key: MaybeRef<string>): Ref<T|undefined> {
  const { suspense, data } = useQuery([key], fun)
  onServerPrefetch(suspense)
  return data
}

export function localePath(path: string, i18n: I18n<{}, {}, {}, Locale, false>['global']) {
  if (i18n.locale.value == i18n.fallbackLocale.value) {
    return path
  }
  return `/${i18n.locale.value}${path}`
}

export function useLocalePath() {
  const i18n = useI18n()
  return (path: string) => localePath(path, i18n)
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
  const router = useRouter()
  const { $config } = useContext()
  const i18n = useI18n()

  const switchToLocale = async (code: string) => {
    if (!i18n.availableLocales.includes(code)) {
      const messages = await loadLocale($config.mediaUrl, code)
      i18n.setLocaleMessage(code, messages)
    }

    i18n.locale.value = code

    const to = router.resolve({ params: { locale: code} })
    router.push(to)
  }

  return { locales, switchToLocale }
}

export function useLocaleCookieRedirect() {
  const { switchToLocale, locales } = useSwitchToLocale()
  const i18n = useI18n()
  const route = useRoute()

  const i18nCookieName = 'i18n_redirected'
  if (route.fullPath == '/' && !import.meta.env.SSR) {
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

export function useMeta(fun: () => ReactiveHead) {
  const meta = computed(fun)
  useHead(meta)
}

export function useRedirect() {
  const pageContext = usePageContext()
  return (status: number, url: string) => pageContext.redirectTo = { status, url }
}

interface ValidateContext {
  params: Record<string, string|string[]>
  redirect: (status: number, url: string) => void
  error: (e: { statusCode: number, message: string }) => void
}
export async function useValidate(cb: (context: ValidateContext) => Promise<boolean>) {
  const pageContext = usePageContext()
  const router = useRouter()
  const route = useRoute()

  async function runValidate(route: RouteLocationNormalized) {
    if (pageContext.validated) {
      return
    }

    pageContext.validated = true

    let redirectTarget: { status: number, url: string } | undefined = undefined

    const error = (e: { statusCode: number, message: string }) => redirectTarget = { status: e.statusCode, url: '/error' }
    const redirect = (status: number, url: string) => redirectTarget = { status, url }

    const context: ValidateContext = { params: route.params, redirect, error }
    const isValid = await cb(context)

    if (!isValid) {
      redirectTarget = redirectTarget ?? { status: 404, url: '/404' }
    }

    if (redirectTarget != undefined) {
      if (import.meta.env.SSR) {
        pageContext.redirectTo = redirectTarget
      } else {
        router.replace(redirectTarget.url)
      }
    }
  }

  onBeforeRouteUpdate(async (to) => {
    pageContext.validated = false
    await runValidate(to)
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
