import en from './en.json'
import de from './de.json'
import es from './es.json'
import ua from './ua.json'

// TODO lazy-load these from media or static later
const staticStrings = { en, de, es, ua }

async function getTraduoraStrings($http, $config, locale) {
  const tokenResponse = await $http.$post(`${$config.traduoraUrl}/api/v1/auth/token`, {
    grant_type: 'client_credentials',
    client_id: $config.traduoraClientId,
    client_secret: $config.traduoraSecret,
  })
  const token = tokenResponse.access_token
  return await $http.$get(`${$config.traduoraUrl}/api/v1/projects/${$config.traduoraProjectId}/exports?locale=${locale}&format=jsonflat`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
}

export default async ({ $http, $config }, locale) => {
  const lazyStrings = await $http.$get($config.mediaUrl + '/translations/' + locale + '.json').catch(e => ({}))

  const strings = $config.traduoraProjectId != '' ? await getTraduoraStrings($http, $config, locale) : staticStrings[locale]

  const localeStrings = Object.keys(strings)
    .filter((key) => strings[key] != '')
    .reduce((localeStrings, key) => ({ ...localeStrings, [key]: strings[key] }), {})
  return Object.assign({}, localeStrings, lazyStrings)
}
