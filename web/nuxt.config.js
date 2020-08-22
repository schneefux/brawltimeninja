import path from 'path'
import axios from 'axios'

import { camelToKebab } from './lib/util'

export default {
  mode: 'universal',
  telemetry: false,
  modern: 'server',

  head: {
    titleTemplate: '%s - Brawl Time Ninja',
    script: [
      { src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', async: true },
      {
        type: 'text/javascript',
        innerHTML: '(adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1;',
      },
    ],
    __dangerouslyDisableSanitizers: ['script'],
  },

  meta: {
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
    name: 'Brawl Time Ninja',
    description: 'Track Brawl Stars profile stats. Calculate your win rate, how many hours you play and other statistics. View Tier Lists for current events and get gameplay tips.',
    author: 'schneefux',
    theme_color: '#3490dc', // primary
  },

  pwa: {
    manifest: {
      name: 'Brawl Time Ninja',
      short_name: 'Brawl Time',
      description: 'Track Brawl Stars stats, hours played and view Tier Lists.',
      theme_color: '#3490dc', // primary
    },
    workbox: {
      runtimeCaching: [{
        urlPattern: process.env.MEDIA_URL + '/.*',
        handler: 'staleWhileRevalidate',
      }, {
        urlPattern: process.env.API_URL + '/.*',
        handler: 'networkFirst',
      }],
      // prefix all cache keys with release id
      // write release id to a custom option
      // -> sw.js changes on deploy
      cacheNames: {
        prefix: 'brawltimeninja@' + process.env.GIT_REV,
      },
      release: 'brawltimeninja@' + process.env.GIT_REV,
      // custom service worker with cache busting on release
      swTemplate: process.env.NODE_ENV == 'development' ? undefined : path.resolve(__dirname, 'static/sw-template.js'),
    },
  },

  loading: { color: '#ffed4a' }, // secondary

  css: [
    '~/assets/css/tailwind.css',
    '~/assets/css/app.css',
    ...(process.env.NODE_ENV == 'development' ? ['~/assets/css/development.css'] : []),
  ],

  plugins: [
    { src: '~/plugins/persist', mode: 'client' },
    { src: '~/plugins/adsense', mode: 'client' },
    { src: '~/plugins/analytics', mode: 'client' },
    { src: '~/plugins/visibility', mode: 'client' },
    { src: '~/plugins/slider', mode: 'client' },
    { src: '~/plugins/plotly', mode: 'client' },
    { src: '~/plugins/custom-components' },
  ],

  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/redirect-module',
    '@nuxtjs/sentry',
    '@nuxt/content',
    '@nuxtjs/sitemap',
  ],

  buildModules: [
    '@nuxt/typescript-build',
    '@nuxt/components',
  ],

  loaders: {
    // fixes hot reloading of tsx components
    // https://github.com/vuejs/vue-loader/issues/687
    ts: {
      transpileOnly: true,
    },
    tsx: {
      transpileOnly: true,
    },
  },

  components: [ {
    path: '~/components',
    ignore: ['**/media-img.tsx'], // loaded by plugin instead
  } ],

  router: {
    middleware: ['unpack-store'],
  },

  axios: {
  },

  redirect: [
    { from: '^/meta$', to: '/tier-list/brawler', statusCode: 301 },
    { from: '^/meta/(.*)$', to: '/tier-list/$1', statusCode: 301 },
  ],

  sentry: {
    // set $SENTRY_DSN, $SENTRY_AUTH_TOKEN, $SENTRY_ORG and $SENTRY_PROJECT
    // auth token is an organization integration auth token (developer settings)
    // with project write, release admin and org read access
    config: {
      ignoreErrors: [/frameElement/],
      release: 'brawltimeninja@' + process.env.GIT_REV,
    },
    disabled: process.env.SENTRY_DISABLED || process.env.NODE_ENV == 'development' || process.env.SENTRY_DSN == undefined,
    publishRelease: true,
    sourceMapStyle: 'hidden-source-map',
    webpackConfig: {
      setCommits: {
        repo: 'schneefux/brawltimeninja',
        commit: process.env.GIT_REV,
      },
    },
  },

  env: {
    branch: process.env.BRANCH || '',
    mediaUrl: (process.env.MEDIA_URL || '').replace(/\/$/, ''), // replace trailing slash
    release: (process.env.GIT_REV || 'dev').slice(0, 6),
  },

  build: {
    extend(config, ctx) {
    },
    extractCSS: true,
    postcss: {
      plugins: {
        tailwindcss: path.resolve('./tailwind.config.js'),
        autoprefixer: {},
        ...(process.env.NODE_ENV === 'production'
        ? {
          '@fullhuman/postcss-purgecss': {
            content: [
              path.join(__dirname, './pages/**/*.vue'),
              path.join(__dirname, './layouts/**/*.vue'),
              path.join(__dirname, './components/**/*.vue'),
              path.join(__dirname, './components/**/*.tsx'),
              path.join(__dirname, './content/**/*.md'),
              path.join(__dirname, 'node_modules/vue-range-component/dist/vue-range-slider.css'), // whitelist all
            ],
            defaultExtractor: content =>
              content.match(/[\w-\/:!/]+/g) || [],
            whitelist: ['html', 'body', 'nuxt-progress']
          }
        }: {})
      },
      preset: { autoprefixer: { grid: true } },
    },
  },

  sitemap: {
    // generated during run time
    gzip: true,
    exclude: ['/embed/**'],
    async routes() {
      const routes = []

      try {
        const events = await axios.get(`${process.env.API_URL}/api/events`)
        Object.entries(events.data).forEach(([eventId, event]) => {
          const modeRoute = `/tier-list/mode/${camelToKebab(event.mode)}`
          if (!routes.includes(modeRoute)) {
            routes.push(modeRoute)
          }
          routes.push(`/tier-list/map/${eventId}`)
        })
      } catch (err) {
        console.error('error adding events to sitemap', err)
      }

      try {
        const topTrophies = await axios.get(`${process.env.API_URL}/api/leaderboard/trophies`)
        topTrophies.data.forEach(({ tag }) => routes.push(`/player/${tag}`))
      } catch (err) {
        console.error('error adding trophy leaderboard players to sitemap', err)
      }

      try {
        const topHours = await axios.get(`${process.env.API_URL}/api/leaderboard/hours`)
        topHours.data.forEach(({ tag }) => routes.push(`/player/${tag}`))
      } catch (err) {
        console.error('error adding exp leaderboard players to sitemap', err)
      }

      return routes
    },
  },

  content: {
    // breaks media-img component registration
    // https://github.com/nuxt/content/issues/261
    liveEdit: false,
  },
}
