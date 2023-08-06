import { Config } from "@/renderer/types"

export type LocaleCode = 'en' | 'de' | 'es' | 'ua' | 'it' | 'ru'
export type LocaleIso = 'en' | 'de' | 'es' | 'uk' | 'it' | 'ru'

export interface Locale {
  code: LocaleCode
  iso: LocaleIso // 2 letter ISO code, equal to or prefix of navigator.language
  file: string
  emoji: string
  show: boolean
  supported: boolean // whether Brawl Stars supports this language
}

export const locales: Locale[] = [{
  code: 'en',
  iso: 'en',
  file: 'en.js',
  emoji: '🇬🇧',
  show: true,
  supported: true,
}, {
  code: 'de',
  iso: 'de',
  file: 'de.js',
  emoji: '🇩🇪',
  show: true,
  supported: true,
}, {
  code: 'es',
  iso: 'es',
  file: 'es.js',
  emoji: '🇪🇸',
  show: true,
  supported: true,
}, {
  code: 'ua',
  iso: 'uk',
  file: 'ua.js',
  emoji: '🇺🇦',
  show: true,
  supported: false,
}, {
  code: 'it',
  iso: 'it',
  file: 'it.js',
  emoji: '🇮🇹',
  show: true,
  supported: true,
}, {
  code: 'ru',
  iso: 'ru',
  file: 'ru.js',
  emoji: '🇷🇺',
  show: false,
  supported: true,
}]
export const defaultLocale = locales[0]

export interface TraduoraToken {
  token: string
  expirationDate: Date
}

export async function getTraduoraToken(
    { url, clientId, secret }: { url: string, clientId: string, secret: string }
): Promise<TraduoraToken> {
  const expirationDate = new Date()
  const response = await fetch(`${url}/api/v1/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: secret,
    }),
  })
  const json = await response.json() as {
    access_token: string
    token_type: string // 'bearer'
    expires_in: string // '86400s'
  }
  expirationDate.setSeconds(expirationDate.getSeconds() + parseInt(json.expires_in))
  return {
    token: json.access_token,
    expirationDate,
  }
}

const traduoraCache = new Map<LocaleCode, {
  strings: Record<string, string>,
  expirationDate: Date
}>()
async function getTraduoraStrings(localeCode: LocaleCode, traduoraConfig: NonNullable<Config['traduora']>) {
  // in Traduora, Ukrainian is uk (not ua)
  const cache = traduoraCache.get(localeCode)
  if (cache == undefined || cache.expirationDate <= new Date()) {
    const strings = await fetch(`${traduoraConfig.url}/api/v1/projects/${traduoraConfig.projectId}/exports?locale=${localeCode}&format=jsonflat`, {
      headers: {
        'Authorization': `Bearer ${traduoraConfig.token}`,
      },
    }).then(r => r.json() as Promise<Record<string, string>>)
    const expirationDate = new Date()
    expirationDate.setSeconds(expirationDate.getSeconds() + 60) // cache for 1min
    traduoraCache.set(localeCode, {
      strings,
      expirationDate,
    })
  }
  return traduoraCache.get(localeCode)!.strings
}

async function loadLocale(locale: Locale, config: Config) {
  const localStrings = await import(`../locales/${locale.code}.json`)
    .catch(() => ({ default: {} })) as { default: Record<string, string> }
  const mediaStrings = locale.supported ? await fetch(config.mediaUrl + '/translations/' + locale.iso + '.json')
    .then(r => r.json())
    .catch(() => ({})) as Record<string, string> : {}
  const traduoraStrings = config.traduora != undefined ? await getTraduoraStrings(locale.code, config.traduora).catch(() => ({})) : {}
  const strings = Object.assign({}, localStrings.default, mediaStrings, traduoraStrings)
  const filteredStrings = Object.fromEntries(
    Object.entries(strings).filter(([key, value]) => value != '')
  )
  return filteredStrings
}

// merge both locale maps to send fewer strings to the client
export async function loadLocaleWithFallback(locale: Locale, fallbackLocale: Locale, config: Config) {
  const localeStrings = await loadLocale(locale, config)
  const fallbackLocaleStrings = locale.iso == fallbackLocale.iso ? localeStrings : await loadLocale(fallbackLocale, config)

  return Object.assign({}, fallbackLocaleStrings, localeStrings)
}
