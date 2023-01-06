import { IKlickerService } from "types";
import { inject, InjectionKey, Ref } from "vue";

export interface PluginConfig {
  klicker: IKlickerService
  translate: (key: string, args?: any) => string
  /**
   * Inject a data fetcher like Nuxt asyncData or vue-query
   * Requirements:
   * - It should cache results by key (state management)
   * - It should deduplicate queries
   * - It should log errors to Sentry
   */
  useQuery: <T, E>(key: string, handler: () => Promise<T>) => {
    loading: Ref<boolean>,
    data: Ref<T|null>,
    error: Ref<E|null>,
    refresh: () => Promise<void>,
  }
}

export const KlickerConfigInjectionKey = Symbol('klicker') as InjectionKey<PluginConfig>

export const useKlicker = () => {
  const pluginConfig = inject(KlickerConfigInjectionKey)!

  const $klicker = pluginConfig.klicker
  const translate = pluginConfig.translate
  const useQuery = pluginConfig.useQuery

  return {
    $klicker,
    translate,
    useQuery,
  }
}

