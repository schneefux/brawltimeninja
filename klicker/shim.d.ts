declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module '#imports' {
  import NuxtShim from './fixtures/nuxt.shim'
  export const useNuxtApp = NuxtShim.useNuxtApp
  export const useLazyAsyncData = NuxtShim.useLazyAsyncData
}
