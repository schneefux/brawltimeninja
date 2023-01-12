import vue from '@vitejs/plugin-vue'
import ssr from 'vite-plugin-ssr/plugin'
import Components from 'unplugin-vue-components/vite'
import UnheadVite from '@unhead/addons/vite'
import { UserConfig } from 'vite'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

const config: UserConfig = {
  plugins: [
    Components({
      dirs: './components',
      dts: true,
    }),
    vue(),
    ssr(),
    UnheadVite(),
    visualizer(),
  ],
  optimizeDeps: {
    include: ['@schneefux/klicker'],
    exclude: [],
  },
  build: {
    commonjsOptions: {
      include: [/@schneefux\/klicker/, /node_modules/],
    },
  },
  resolve: {
    dedupe: ['vue'], // https://github.com/vitejs/vite/issues/7454#issuecomment-1079830994
    alias: {
      '~': path.resolve(__dirname),
      '@': path.resolve(__dirname),
      'sampson': path.resolve('node_modules/sampson/dist/lib.es6.js'),
    },
  },
}

export default config
