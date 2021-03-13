import en from './en.json'
import de from './de.json'
import es from './es.json'

// TODO lazy-load these from media or static later
const strings = { en, de, es }

export default async ({ $axios, $config }, locale) => {
  const lazyStrings = await $axios.$get($config.mediaUrl + '/translations/' + locale + '.json').catch(e => ({}))
  return Object.assign({}, strings[locale], lazyStrings)
}
