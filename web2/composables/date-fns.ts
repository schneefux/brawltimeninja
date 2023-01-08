import { enUS, de, es, uk, it } from 'date-fns/locale'
import { computed } from 'vue'
import { useContext } from './compat'

export const useDateFnLocale = () => {
  const { i18n } = useContext()
  const locales = { en: enUS, de, es, ua: uk, it }
  const locale = computed(() => locales[i18n.locale])

  return {
    locale,
  }
}
