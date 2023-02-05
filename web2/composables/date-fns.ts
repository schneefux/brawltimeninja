import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { LocaleCode } from '~/locales'

const localeImportMap: Record<LocaleCode, any> = {
  en: () => import('date-fns/locale/en-US/index'),
  de: () => import('date-fns/locale/de/index'),
  es: () => import('date-fns/locale/es/index'),
  ua: () => import('date-fns/locale/uk/index'),
  it: () => import('date-fns/locale/it/index'),
  ru: () => import('date-fns/locale/ru/index'),
}

export const useDateFnLocale = () => {
  const i18n = useI18n()
  const locale = ref()
  onMounted(async () => locale.value = (await localeImportMap[i18n.locale.value as LocaleCode]()).default ?? null)

  return {
    locale,
  }
}
