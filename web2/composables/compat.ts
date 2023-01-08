import { computed, onServerPrefetch, Ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { useKlicker } from '@schneefux/klicker/composables'
import { useI18n } from 'vue-i18n'
import { localePath } from './locale-path'
import { usePageContext } from '~/renderer/usePageContext'
import { navigate } from "vite-plugin-ssr/client/router";
import { BrawltimeKlickerService } from "@/plugins/klicker.service";

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
  const i18n = useI18n()

  return {
    $klicker: $klicker as BrawltimeKlickerService,
    i18n: {
      ...i18n,
      tc: i18n.t,
    },
    localePath,
  }
}

export function useRoute() {
  const pageContext = usePageContext()!

  return computed(() => ({
    fullPath: pageContext.urlPathname,
  }))
}

export function useRouter() {
  return {
    push: (path: string) => navigate(path),
  }
}
