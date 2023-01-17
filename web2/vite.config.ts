import vue from '@vitejs/plugin-vue'
import ssr from 'vite-plugin-ssr/plugin'
import Components from 'unplugin-vue-components/vite'
import UnheadVite from '@unhead/addons/vite'
import { UserConfig } from 'vite'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import Pages from 'vite-plugin-pages'

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
      onRoutesGenerated(routes) {
        return routes.map(r => ({
          ...r,
          path: r.path.substring(1), // remove leading slash to support usage as locale child route
        }))
      },
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
        // exclude HTML https://github.com/vite-pwa/vite-plugin-pwa/issues/120#issuecomment-1202579983
        //globPatterns: ['**/*.{js,css,svg,png,jpg,jpeg,webp,woff,woff2,ttf,otf,ico}'],
        //globIgnores: ['**/*.html'],
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
    visualizer(),
  ],
  assetsInclude: ['assets/content/**/*.md'],
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
    dedupe: ['vue', 'vue3-lazy-hydration'], // https://github.com/vitejs/vite/issues/7454#issuecomment-1079830994
    alias: {
      '~': path.resolve(__dirname),
      '@': path.resolve(__dirname),
      'sampson': path.resolve('node_modules/sampson/dist/lib.es6.js'),
    },
  },
}

export default config
