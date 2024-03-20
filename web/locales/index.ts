import { Config } from "~/config"
import { Cache } from "~/lib/cache"

const LOCALE_CACHE_MINUTES = 60

export type LocaleCode = 'en' | 'de' | 'es' | 'uk' | 'it' | 'ru' | 'pl' | 'bn' | 'br' | 'cn' | 'cz' | 'fi' | 'fr' | 'hi' | 'jp' | 'kr' | 'lt' | 'nl' | 'pt' | 'sk' | 'sv' | 'tr' | 'vi' | 'zh'
export type LocaleIso = 'en' | 'de' | 'es' | 'uk' | 'it' | 'ru' | 'pl' | 'bn' | 'br' | 'cn' | 'cz' | 'fi' | 'fr' | 'hi' | 'jp' | 'kr' | 'lt' | 'nl' | 'pt' | 'sk' | 'sv' | 'tr' | 'vi' | 'zh'

export interface Locale {
  code: LocaleCode // traduora code
  iso: LocaleIso // 2 letter ISO code, equal to or prefix of navigator.language
  emoji: string
  show: boolean
  supported: boolean // whether Brawl Stars supports this language
}

export const locales: Locale[] = [{
  code: 'en',
  iso: 'en',
  emoji: '🇬🇧',
  show: true,
  supported: true,
}, {
  code: 'de',
  iso: 'de',
  emoji: '🇩🇪',
  show: true,
  supported: true,
}, {
  code: 'es',
  iso: 'es',
  emoji: '🇪🇸',
  show: true,
  supported: true,
}, {
  code: 'uk',
  iso: 'uk',
  emoji: '🇺🇦',
  show: true,
  supported: false,
}, {
  code: 'it',
  iso: 'it',
  emoji: '🇮🇹',
  show: true,
  supported: true,
}, {
  code: 'ru',
  iso: 'ru',
  emoji: '🇷🇺',
  show: true,
  supported: true,
}, {
  code: 'pl',
  iso: 'pl',
  emoji: '🇵🇱',
  show: true,
  supported: true,
}, {
  code: 'bn',
  iso: 'bn',
  emoji: '🇧🇩',
  show: true,
  supported: true,
}, {
  code: 'br',
  iso: 'br',
  emoji: '🇧🇷',
  show: true,
  supported: true,
}, {
  code: 'cn',
  iso: 'cn',
  emoji: '🇨🇳',
  show: true,
  supported: true,
}, {
  code: 'cz',
  iso: 'cz',
  emoji: '🇨🇿',
  show: true,
  supported: true,
}, {
  code: 'fi',
  iso: 'fi',
  emoji: '🇫🇮',
  show: true,
  supported: true,
}, {
  code: 'fr',
  iso: 'fr',
  emoji: '🇫🇷',
  show: true,
  supported: true,
}, {
  code: 'hi',
  iso: 'hi',
  emoji: '🇮🇳',
  show: true,
  supported: true,
}, {
  code: 'jp',
  iso: 'jp',
  emoji: '🇯🇵',
  show: true,
  supported: true,
}, {
  code: 'kr',
  iso: 'kr',
  emoji: '🇰🇷',
  show: true,
  supported: true,
}, {
  code: 'lt',
  iso: 'lt',
  emoji: '🇱🇹',
  show: true,
  supported: true,
}, {
  code: 'nl',
  iso: 'nl',
  emoji: '🇳🇱',
  show: true,
  supported: true,
}, {
  code: 'pt',
  iso: 'pt',
  emoji: '🇵🇹',
  show: true,
  supported: true,
}, {
  code: 'sk',
  iso: 'sk',
  emoji: '🇸🇰',
  show: true,
  supported: true,
}, {
  code: 'sv',
  iso: 'sv',
  emoji: '🇸🇪',
  show: true,
  supported: true,
}, {
  code: 'tr',
  iso: 'tr',
  emoji: '🇹🇷',
  show: true,
  supported: true,
}, {
  code: 'vi',
  iso: 'vi',
  emoji: '🇻🇳',
  show: true,
  supported: true,
}, {
  code: 'zh',
  iso: 'zh',
  emoji: '🇨🇳',
  show: true,
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

async function getTraduoraStrings(localeCode: LocaleCode, traduoraConfig: NonNullable<Config['traduora']>) {
  // in Traduora, Ukrainian is uk (not ua)
  return await fetch(`${traduoraConfig.url}/api/v1/projects/${traduoraConfig.projectId}/exports?locale=${localeCode}&format=jsonflat`, {
    headers: {
      'Authorization': `Bearer ${traduoraConfig.token}`,
    },
  }).then(r => r.json() as Promise<Record<string, string>>)
}

const localeCache = new Cache<LocaleCode, Record<string, string>>(LOCALE_CACHE_MINUTES)
async function loadLocale(locale: Locale, config: Config) {
  return await localeCache.getOrUpdate(locale.code, async () => {
    const localStrings = await import(`../locales/${locale.code}.json`)
      .catch(() => ({ default: {} })) as { default: Record<string, string> }
    const mediaStrings = locale.supported ? await fetch(config.mediaUrl + '/translations/' + locale.iso + '.json')
      .then(r => r.json())
      .catch(() => ({})) as Record<string, string> : {}
    const traduoraStrings = config.traduora != undefined ? await getTraduoraStrings(locale.code, config.traduora).catch(() => ({})) : {}
    const strings = Object.assign({}, localStrings.default, mediaStrings, traduoraStrings)
    return Object.fromEntries(
      Object.entries(strings).filter(([key, value]) => value != '')
    )
  })
}

// merge both locale maps to send fewer strings to the client
export async function loadLocaleWithFallback(locale: Locale, fallbackLocale: Locale, config: Config) {
  const localeStrings = await loadLocale(locale, config)
  const fallbackLocaleStrings = locale.iso == fallbackLocale.iso ? localeStrings : await loadLocale(fallbackLocale, config)

  return Object.assign({}, fallbackLocaleStrings, localeStrings)
}
