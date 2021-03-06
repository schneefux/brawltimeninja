import config, { Config } from "~/lib/cube"

interface Cube {
  config: Config
}

declare module 'vue/types/vue' {
  interface Vue {
    $cube: Cube
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $cube: Cube
  }
  interface Context {
    $cube: Cube
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $cube: Cube
  }
}

export default (context, inject) => {
  inject('cube', <Cube>{
    config,
  })
}
