import { App, computed, inject, onServerPrefetch, Ref } from "vue"
import { useQuery } from "@tanstack/vue-query";
import { useKlicker } from '@schneefux/klicker/composables'
import { useI18n } from 'vue-i18n'
import { localePath } from './locale-path'
import { usePageContext } from '~/renderer/usePageContext'
import { navigate } from "vite-plugin-ssr/client/router"
import { BrawltimeKlickerService } from "@/plugins/klicker.service"
import { TrpcInjectionKey } from "@/plugins/trpc"
import { PageContext } from "@/renderer/types"
import { useHead, ReactiveHead } from "@unhead/vue"

/*
 * Nuxt 2 backwards compatibility composables
 */

export function useAsync<T>(fun: () => Promise<T>, key: string): Ref<T|undefined> {
  const { suspense, data } = useQuery([key], fun)
  onServerPrefetch(suspense)
  return data
}

export function useContext() {
  const { $klicker } = useKlicker()
  const $api = inject(TrpcInjectionKey)!
  const i18n = useI18n()

  return {
    $klicker: $klicker as BrawltimeKlickerService,
    $api,
    $supportsWebp: false, // TODO
    $config: {
      mediaUrl: (import.meta.env.MEDIA_URL || 'https://media.brawltime.ninja').replace(/\/$/, ''),
      managerUrl: (import.meta.env.MANAGER_URL || 'https://manager.brawltime.ninja').replace(/\/$/, ''),
      renderUrl: (import.meta.env.RENDER_URL || 'https://render.brawltime.ninja').replace(/\/$/, ''),
    }, // TODO
    $http: {} as any, // TODO
    i18n: {
      ...i18n,
      tc: i18n.t,
    },
    localePath,
    switchLocalePath: () => {}, // TODO
    error: (e: { statusCode: number, message: string }) => {}, // TODO
    $sentry: {
      captureException: (e: any) => {}, // TODO
    },
  }
}

export function injectGlobalProperties(app: App, pageContext: PageContext) {
  app.config.globalProperties.localePath = localePath

  const $route = computed(() => ({
    path: pageContext.urlPathname,
    fullPath: pageContext.urlPathname,
  }))
  //app.config.globalProperties.$route = $route as any
  // TODO is not reactive
  app.config.globalProperties.$route = {
    path: pageContext.urlPathname,
    fullPath: pageContext.urlPathname,
  } as any
}

export function useRoute() {
  const pageContext = usePageContext()!

  return computed(() => ({
    fullPath: pageContext.urlPathname,
    query: pageContext.urlParsed.searchAll,
  }))
}

export function useRouter() {
  return {
    push: (path: string) => navigate(path),
    replace: (route: { query: Record<string, string[]> }) => {
      const searchParams = Object.entries(route.query).flatMap(([key, values]) => values.map(value => [key, value]))
      navigate(`${window.location.pathname}?${new URLSearchParams(searchParams).toString()}`, {
        keepScrollPosition: true,
        overwriteLastHistoryEntry: true,
      })
    },
  }
}

export function useMeta(fun: () => ReactiveHead) {
  const meta = computed(fun)
  useHead(meta)
}
