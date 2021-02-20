import en from './en.json'
import de from './de.json'
import es from './es.json'

// TODO lazy-load these from media or static later
const strings = { en, de, es }

export default async ({ $axios, env }, locale) => {
  const mapStrings = await $axios.$get(env.mediaUrl + '/maps/' + locale + '.json').catch(e => ({}))
  strings[locale].maps = mapStrings
  return strings[locale]
}
