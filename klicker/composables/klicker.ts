import { IKlickerService } from "types";
import { inject, InjectionKey } from "vue";

export interface PluginConfig {
  klicker: IKlickerService
  translate: (key: string, args?: any) => string
  exceptionLogger: (error: Error) => void
}

export const KlickerConfigInjectionKey = Symbol('klicker') as InjectionKey<PluginConfig>

export const useKlicker = () => {
  const pluginConfig = inject(KlickerConfigInjectionKey)!

  const $klicker = pluginConfig.klicker
  const translate = pluginConfig.translate
  const exceptionLogger = pluginConfig.exceptionLogger

  return {
    $klicker,
    translate,
    exceptionLogger,
  }
}

