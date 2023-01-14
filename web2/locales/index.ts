import fetch from 'cross-fetch'

export interface Locale {
  code: string
  iso: string // 2 letter ISO code, equal to or prefix of navigator.language
  file: string
  emoji: string
}

export const locales: Locale[] = [{
  code: 'en',
  iso: 'en',
  file: 'en.js',
  emoji: '🇬🇧',
}, {
  code: 'de',
  iso: 'de',
  file: 'de.js',
  emoji: '🇩🇪',
}, {
  code: 'es',
  iso: 'es',
  file: 'es.js',
  emoji: '🇪🇸',
}, {
  code: 'ua',
  iso: 'uk',
  file: 'ua.js',
  emoji: '🇺🇦',
}, {
  code: 'it',
  iso: 'it',
  file: 'it.js',
  emoji: '🇮🇹',
}]
export const defaultLocale = locales[0]

export async function loadLocale(mediaUrl: string, locale: string) {
  // TODO lazy-load these from media or static later
  const localStrings = await import(`../locales/${locale}.json`) as { default: Record<string, string> }
  const mediaStrings = await fetch(mediaUrl + '/translations/' + locale + '.json')
    .then(r => r.json())
    .catch(() => ({})) as Record<string, string>
  const strings = Object.assign({}, localStrings.default, mediaStrings)
  const filteredStrings = Object.fromEntries(
    Object.entries(strings).filter(([key, value]) => value != '')
  )
  return filteredStrings
}
