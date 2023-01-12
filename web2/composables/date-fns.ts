import { Locale } from 'date-fns'
import de from 'date-fns/locale/de/index'
import es from 'date-fns/locale/es/index'
import uk from 'date-fns/locale/uk/index'
import it from 'date-fns/locale/it/index'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export const useDateFnLocale = () => {
  const i18n = useI18n()
  const locale = computed(() => {
    const locales: Record<string, Locale> = { de, es, ua: uk, it }
    return locales[i18n.locale.value]
  })

  return {
    locale,
  }
}
