import { computed, useContext } from '@nuxtjs/composition-api'
import { enUS, de, es, uk } from 'date-fns/locale'

export const useDateFnLocale = () => {
  const { i18n } = useContext()
  const locales = { en: enUS, de, es, ua: uk }
  const locale = computed(() => locales[i18n.locale])

  return {
    locale,
  }
}
