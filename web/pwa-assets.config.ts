import {
  defineConfig,
  minimal2023Preset as preset
} from '@vite-pwa/assets-generator/config'

export default defineConfig({
  headLinkOptions: {
    basePath: '/icons/',
    preset: '2023'
  },
  preset,
  images: ['public/icons/logo.svg'],
})
