import vue from '@vitejs/plugin-vue'
import ssr from 'vike/plugin'
import Components from 'unplugin-vue-components/vite'
import UnheadVite from '@unhead/addons/vite'
import { UserConfig } from 'vite'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import Pages from 'vite-plugin-pages'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { vavite } from 'vavite'
import legacy from '@vitejs/plugin-legacy'
import manifest from './manifest'

const config: UserConfig = {
  buildSteps: [
    { name: "client" },
    {
      name: "server",
      config: {
        build: {
          ssr: true,
        },
      },
    },
  ],
  plugins: [
    vavite({
      serverEntry: "/server/index.ts",
      serveClientAssetsInDev: true,
    }),
    Components({
      dirs: './components',
      dts: true,
    }),
    vue(),
    Pages({
      dirs: './pages',
      importMode: 'async',
      routeStyle: 'nuxt',
      resolver: 'vue',
    }),
    VitePWA({
      injectRegister: null, // not supported by vike, injected in all.page.client instead
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
      },
      workbox: {
        // tell workbox not to look for an index.html
        // https://github.com/vite-pwa/vite-plugin-pwa/issues/120#issuecomment-1202579983
        navigateFallback: null,
      },
      manifest,
    }),
    UnheadVite(),
    ssr({ disableAutoFullBuild: true }),
    legacy(),
    process.env.VITE_GIT_REV != undefined ? sentryVitePlugin({
      release: {
        name: `brawltimeninja@${process.env.VITE_GIT_REV}`,
        setCommits: {
          auto: false,
          repo: 'schneefux/brawltimeninja',
          commit: process.env.VITE_GIT_REV,
        },
      },
      telemetry: false,
    }) : undefined,
    visualizer({
      gzipSize: true
    }),
  ],
  assetsInclude: ['assets/content/**/*.md'],
  build: {
    sourcemap: true, // for Sentry
  },
  resolve: {
    dedupe: ['vue', 'vue3-lazy-hydration'], // https://github.com/vitejs/vite/issues/7454#issuecomment-1079830994
    alias: {
      '~': path.resolve(__dirname),
    },
  },
  define: {
    // enable hydration mismatch details in production build (TODO: disable later)
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true'
  },
  ssr: {
    // vega-embed has a broken ESM config since https://github.com/vega/vega-embed/pull/1301/files
    noExternal: ['vega-embed'],
  },
}

export default config
