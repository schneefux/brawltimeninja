import en from './en.json'
import de from './de.json'
import es from './es.json'

// TODO lazy-load these from media or static later
const strings = { en, de, es }

export default async ({ $http, $config }, locale) => {
  const lazyStrings = await $http.$get($config.mediaUrl + '/translations/' + locale + '.json').catch(e => ({}))
  const localeStrings = Object.keys(strings[locale])
    .filter((key) => strings[locale][key] != '')
    .reduce((localeStrings, key) => ({ ...localeStrings, [key]: strings[locale][key] }), {})
  return Object.assign({}, localeStrings, lazyStrings)
}
