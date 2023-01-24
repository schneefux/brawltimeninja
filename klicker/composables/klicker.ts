import { IKlickerService } from "../types";
import { inject, InjectionKey, Ref } from "vue";

export interface AsyncQuery<T, E> {
  loading: Ref<boolean>,
  data: Ref<T|null>,
  error: Ref<E|null>,
  refresh: () => Promise<void>,
}

export interface PluginConfig {
  klicker: IKlickerService
  translate: (key: string, args?: any) => string
  /**
   * Inject a data fetcher like Nuxt asyncData or vue-query
   * Requirements:
   * - It should refetch when the key ref changes
   * - It should cache results by key (state management)
   * - It should deduplicate queries
   * - It should log errors to Sentry
   */
  useQuery: <T, E>(key: Ref<string>, handler: () => Promise<T>) => AsyncQuery<T, E>
  navigate: (path: string) => void
  /**
   * Requirements:
   *  - It should support the "to" property
   *  - It should have a default slot with a "navigate" function as property when the "custom" property is set
   */
  linkComponent: string
  managerUrl: string
}

export const KlickerConfigInjectionKey = Symbol('klicker') as InjectionKey<PluginConfig>

export const useKlickerConfig = () => {
  const pluginConfig = inject(KlickerConfigInjectionKey)!

  const $klicker = pluginConfig.klicker
  const translate = pluginConfig.translate
  const useQuery = pluginConfig.useQuery
  const navigate = pluginConfig.navigate
  const linkComponent = pluginConfig.linkComponent
  const managerUrl = pluginConfig.managerUrl

  return {
    $klicker,
    translate,
    useQuery,
    navigate,
    linkComponent,
    managerUrl,
  }
}

export const useKlicker = () => {
  const { $klicker } = useKlickerConfig()
  return $klicker
}
