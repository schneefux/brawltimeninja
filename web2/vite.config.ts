import vue from '@vitejs/plugin-vue'
import ssr from 'vite-plugin-ssr/plugin'
import Components from 'unplugin-vue-components/vite'
import { UserConfig } from 'vite'
import path from 'path'

const config: UserConfig = {
  plugins: [
    Components({
      dirs: './components',
      dts: true,
    }),
    vue(),
    ssr(),
  ],
  optimizeDeps: {
    //include: ['sampson'],
    exclude: [],
  },
  build: {
    commonjsOptions: {
      //include: [/sampson/, /node_modules/],
    },
  },
  resolve: {
    dedupe: ['vue'], // https://github.com/vitejs/vite/issues/7454#issuecomment-1079830994
    alias: {
      '~': path.resolve(__dirname),
      '@': path.resolve(__dirname),
      //'sampson': path.resolve('node_modules/sampson/dist/lib.js'),
    },
  },
}

export default config
