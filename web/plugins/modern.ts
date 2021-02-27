declare module 'vue/types/vue' {
  interface Vue {
    $supportsWebp: boolean
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $supportsWebp: boolean
  }
  interface Context {
    $supportsWebp: boolean
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $supportsWebp: boolean
  }
}

export default (context, inject) => {
  let supportsWebp = false

  if (process.server) {
    supportsWebp = (context.req.headers['accept'] != undefined && context.req.headers['accept'].toLowerCase().includes('image/webp'))
  }

  if (process.client) {
    supportsWebp = (document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') == 0)

    if (supportsWebp) {
      document.querySelector('html')!.classList.add('webp')
    } else {
      document.querySelector('html')!.classList.add('no-webp')
    }
  }

  inject('supportsWebp', supportsWebp)
}
