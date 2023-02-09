import vue from '@vitejs/plugin-vue'
import ssr from 'vite-plugin-ssr/plugin'
import Components from 'unplugin-vue-components/vite'
import UnheadVite from '@unhead/addons/vite'
import { UserConfig } from 'vite'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import Pages from 'vite-plugin-pages'
import { sentryVitePlugin } from '@sentry/vite-plugin'

const config: UserConfig = {
  plugins: [
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
      devOptions: {
        enabled: false,
      },
      registerType: 'autoUpdate',
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
      workbox: {
        // disable precaching
        globIgnores: ['**/*'],
        navigateFallback: null,
        // FIXME depends on env variables being available at build time
        // - use *.brawltime.ninja as urlPattern instead
        runtimeCaching: [{
          urlPattern: process.env.MEDIA_URL + '/.*',
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'media',
            expiration: {
              maxAgeSeconds: 60 * 60 * 24 * 31,
            },
          },
        }, {
          urlPattern: process.env.CUBE_URL + '/.*',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'cube',
            expiration: {
              maxAgeSeconds: 60 * 60,
            },
          },
        }, {
          urlPattern: process.env.MANAGER_URL + '/.*',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'manager',
            expiration: {
              maxAgeSeconds: 60 * 60 * 24,
            },
          },
        }],
      },
    }),
    UnheadVite(),
    ssr(),
    process.env.VITE_GIT_REV != undefined ? sentryVitePlugin({
      include: './dist',
      release: `brawltimeninja@${process.env.VITE_GIT_REV}`,
      setCommits: {
        auto: false,
        repo: 'schneefux/brawltimeninja',
        commit: process.env.VITE_GIT_REV,
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
