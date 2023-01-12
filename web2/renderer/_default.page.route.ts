export { onBeforeRoute }

import { extractLocale } from '../locales/extractLocale'
import { PageContext } from './types'

function onBeforeRoute(pageContext: PageContext) {
  let urlOriginal = pageContext.urlOriginal

  const { urlWithoutLocale, locale } = extractLocale(urlOriginal)
  urlOriginal = urlWithoutLocale

  return {
    pageContext: {
      locale,
      urlOriginal,
    }
  }
}
