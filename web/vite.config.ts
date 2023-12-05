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

const config: UserConfig = {
  buildSteps: [
    { name: "client" },
    {
      name: "server",
      config: {
        build: {
          ssr: true,
          rollupOptions: {
            output: {
              // We have to disable this for multiple entries
              inlineDynamicImports: false,
            },
          },
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
      manifest: {
        id: '/?standalone=true',
        start_url: '/?standalone=true',
        name: 'Brawl Time Ninja',
        short_name: 'Brawl Time',
        description: 'Track Brawl Stars stats, hours played and view Tier Lists.',
        theme_color: '#facc15', // yellow-400
        icons: [
        // opaque background, centered
        {
          'src': '/icons/maskable_icon_x48.png',
          'sizes': '48x48',
          'type': 'image/png',
          'purpose': 'maskable'
        }, {
          'src': '/icons/maskable_icon_x72.png',
          'sizes': '72x72',
          'type': 'image/png',
          'purpose': 'maskable'
        },
        {
          'src': '/icons/maskable_icon_x96.png',
          'sizes': '96x96',
          'type': 'image/png',
          'purpose': 'maskable'
        },
        {
          'src': '/icons/maskable_icon_x128.png',
          'sizes': '128x128',
          'type': 'image/png',
          'purpose': 'maskable'
        },
        {
          'src': '/icons/maskable_icon_x192.png',
          'sizes': '192x192',
          'type': 'image/png',
          'purpose': 'maskable'
        },
        {
          'src': '/icons/maskable_icon_x384.png',
          'sizes': '384x384',
          'type': 'image/png',
          'purpose': 'maskable'
        },
        {
          'src': '/icons/maskable_icon_x512.png',
          'sizes': '512x512',
          'type': 'image/png',
          'purpose': 'maskable'
        },
        // transparent background
        {
          'src': '/icons/icon_x48.png',
          'sizes': '48x48',
          'type': 'image/png',
          'purpose': 'any'
        }, {
          'src': '/icons/icon_x72.png',
          'sizes': '72x72',
          'type': 'image/png',
          'purpose': 'any'
        },
        {
          'src': '/icons/icon_x96.png',
          'sizes': '96x96',
          'type': 'image/png',
          'purpose': 'any'
        },
        {
          'src': '/icons/icon_x128.png',
          'sizes': '128x128',
          'type': 'image/png',
          'purpose': 'any'
        },
        {
          'src': '/icons/icon_x192.png',
          'sizes': '192x192',
          'type': 'image/png',
          'purpose': 'any'
        },
        {
          'src': '/icons/icon_x384.png',
          'sizes': '384x384',
          'type': 'image/png',
          'purpose': 'any'
        },
        {
          'src': '/icons/icon_x512.png',
          'sizes': '512x512',
          'type': 'image/png',
          'purpose': 'any'
        }],
      },
    }),
    UnheadVite(),
    ssr({ disableAutoFullBuild: true }),
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
    visualizer(),
  ],
  assetsInclude: ['assets/content/**/*.md'],
  build: {
    sourcemap: true, // for Sentry
  },
  resolve: {
    dedupe: ['vue', 'vue3-lazy-hydration'], // https://github.com/vitejs/vite/issues/7454#issuecomment-1079830994
    alias: {
      '~': path.resolve(__dirname),
      '@': path.resolve(__dirname),
    },
  },
}

export default config
