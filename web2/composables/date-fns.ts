import { Locale } from 'date-fns'
import { enUS, de, es, uk, it } from 'date-fns/locale'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export const useDateFnLocale = () => {
  const i18n = useI18n()
  const locale = computed(() => {
    const locales: Record<string, Locale> = { en: enUS, de, es, ua: uk, it }
    return locales[i18n.locale.value]
  })

  return {
    locale,
  }
}
