import { MetaInfo } from 'vue-meta'

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    head?: MetaInfo | (() => MetaInfo)
  }
}
