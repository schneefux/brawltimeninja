import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { LocaleIso } from '~/locales'
import { Locale } from 'date-fns'
import { enUS, de, es, uk, it, ru, pl } from 'date-fns/locale'

// unfortunately, these cannot be lazy-loaded,
// they have to be available immediately as to not cause hydration mismatches
const localeImportMap: Record<LocaleIso, Locale> = { en: enUS, de, es, uk, it, ru, pl, }

export const useDateFnLocale = () => {
  const i18n = useI18n()
  const locale = computed(() => localeImportMap[i18n.locale.value as LocaleIso])

  return {
    locale,
  }
}
