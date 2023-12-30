import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { LocaleIso } from '~/locales'
import { Locale } from 'date-fns'

const localeImportMap: Record<LocaleIso, () => Promise<Locale>> = {
  en: () => import('date-fns/locale/en-US').then(i => i['enUS']),
  de: () => import('date-fns/locale/de').then(i => i['de']),
  es: () => import('date-fns/locale/es').then(i => i['es']),
  uk: () => import('date-fns/locale/uk').then(i => i['uk']),
  it: () => import('date-fns/locale/it').then(i => i['it']),
  ru: () => import('date-fns/locale/ru').then(i => i['ru']),
  pl: () => import('date-fns/locale/pl').then(i => i['pl']),
}

export const useDateFnLocale = () => {
  const i18n = useI18n()
  const locale = ref<Locale>()
  onMounted(async () => {
    if (i18n.locale.value in localeImportMap) {
      locale.value = (await localeImportMap[i18n.locale.value as LocaleIso]())
    }
  })

  return {
    locale,
  }
}
