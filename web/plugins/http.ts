import { Plugin } from '@nuxt/types'

// see https://github.com/nuxt/http/pull/105
const plugin: Plugin = function ({ $http }) {
  if (process.server) {
    return
  }

  const noopLoading = {
    finish: () => { },
    start: () => { },
    fail: () => { },
    set: () => { }
  }

  const $loading = () => {
    const $nuxt = typeof window !== 'undefined' && (<any>window).__NUXT__
    return ($nuxt && $nuxt.$loading && $nuxt.$loading.set) ? $nuxt.$loading : noopLoading
  }

  let currentRequests = 0

  $http.onRequest(() => {
    currentRequests++
  })

  $http.onResponse(() => {
    currentRequests--
    if (currentRequests <= 0) {
      currentRequests = 0
      $loading().finish()
    }
  })

  $http.onError(() => {
    currentRequests--

    $loading().fail()
    $loading().finish()
  })
}

export default plugin
