import { fetch } from 'undici'

const customFetch: typeof fetch = (input, init) => {
  return fetch(input, {
    ...init,
    headers: {
      'User-Agent': 'BrawlTimeNinja/1.0 (+https://brawltime.ninja; dev@brawltime.ninja)',
      'Accept-Encoding': 'gzip, deflate, br',
      ...init?.headers,
    },
  })
}

export { customFetch }
export default customFetch
