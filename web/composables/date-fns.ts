import { computed, MaybeRef, unref, watch, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { LocaleIso } from '~/locales'
import { Locale, format, formatDistanceToNow } from 'date-fns'
import { enUS, de, es, uk, it, ru, pl, bn, fi, fr, hi, ja, lt, nl, pt, sk, sv, tr, vi, zhCN, ptBR, cs, ko } from 'date-fns/locale'
import { ssrRef } from './compat'

// unfortunately, these cannot be lazy-loaded,
// they have to be available immediately as to not cause hydration mismatches
const localeImportMap: Record<LocaleIso, Locale> = {
  en: enUS,
  de,
  es,
  uk,
  it,
  ru,
  pl,
  bn,
  cn: zhCN,
  br: ptBR,
  cs,
  fi,
  fr,
  hi,
  ja,
  ko,
  lt,
  nl,
  pt,
  sk,
  sv,
  tr,
  vi,
  zh: zhCN
}

export const useDateFnLocale = () => {
  const i18n = useI18n()
  const locale = computed(() => localeImportMap[i18n.locale.value as LocaleIso])

  return {
    locale,
  }
}

/** SSR-friendly relative date formatting */
export const useFormattedDistanceToNow = (timestamp: MaybeRef<Date|undefined>, { addSuffix }: { addSuffix: MaybeRef<boolean> }) => {
  const { locale } = useDateFnLocale()
  const id = useId()

  const formatted = ssrRef('…', `timediff-${id}`)

  const updateFormatted = () => {
    const ts = unref(timestamp)
    if (ts == undefined) {
      formatted.value = 'never'
    } else {
      formatted.value = formatDistanceToNow(ts, {
        addSuffix: unref(addSuffix),
        locale: locale.value,
      })
    }
  }
  watch(() => [unref(timestamp), unref(locale)], updateFormatted, {
    immediate: true,
  })

  return formatted
}


/** SSR-friendly date formatting */
export const useFormattedDate = (timestamp: MaybeRef<Date>, formatStr: MaybeRef<string>) => {
  const { locale } = useDateFnLocale()
  const id = useId()

  const formatted = ssrRef('…', `timestamp-${id}`)

  const updateFormatted = () => {
    formatted.value = format(unref(timestamp), unref(formatStr), {
      locale: locale.value,
    })
  }
  watch(() => [unref(timestamp), unref(formatStr), unref(locale)], updateFormatted, {
    immediate: true,
  })

  return formatted
}
