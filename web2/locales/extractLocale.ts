export { extractLocale }

import { locales, defaultLocale } from './index'

function extractLocale(url: string) {
  const urlPaths = url.split('/')

  const firstPath = urlPaths[1]
  const locale = locales.find(l => l.code == firstPath)
  if (locale != undefined) {
    return {
      locale,
      urlWithoutLocale: '/' + urlPaths.slice(2).join('/'),
    }
  }

  return {
    locale: defaultLocale,
    urlWithoutLocale: url,
  }
}
