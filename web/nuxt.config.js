import path from 'path'
import fetch from 'node-fetch'

// TODO migrate this file to ts and import from util
const camelToKebab = (s) => s.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
const slugify = (str) => str.split(' ').join('-')
const brawlerId = (entry) => entry.name.replace(/\.| /g, '_').toLowerCase()

export default {
  telemetry: false,
  modern: process.env.NODE_ENV == 'development' ? false : 'server',

  head: {
    titleTemplate: '%s - Brawl Time Ninja',
    script: [
      { src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6856963757796636', async: true, crossorigin: 'anonymous' },
      {
        innerHTML: '(adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1;',
        async: false,
      },
    ],
    __dangerouslyDisableSanitizers: ['script'],
  },

  meta: {
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
    name: 'Brawl Time Ninja',
    description: 'Track Brawl Stars profile stats. Calculate your win rate, how many hours you play and other statistics. View Tier Lists for current events and get gameplay tips.',
    author: 'schneefux',
    theme_color: '#facc15', // yellow-400
  },

  pwa: {
    manifest: {
      name: 'Brawl Time Ninja',
      short_name: 'Brawl Time',
      description: 'Track Brawl Stars stats, hours played and view Tier Lists.',
      theme_color: '#facc15', // yellow-400
    },
    workbox: {
      // FIXME depends on env variables being available at build time
      // - use *.brawltime.ninja as urlPattern instead
      runtimeCaching: [{
        urlPattern: process.env.MEDIA_URL + '/.*',
        handler: 'staleWhileRevalidate',
      }, {
        urlPattern: process.env.API_URL + '/.*',
        handler: 'networkFirst',
      }, {
        urlPattern: process.env.CLICKER_URL + '/.*',
        handler: 'networkFirst',
      }, {
        urlPattern: process.env.CUBE_URL + '/.*',
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

  loading: { color: '#dc2626' }, // red-600

  css: [
    '~/assets/css/transitions.css',
    ...(process.env.NODE_ENV == 'development' ? ['~/assets/css/development.css'] : []),
  ],

  plugins: [
    { src: '~/plugins/persist', mode: 'client' },
    { src: '~/plugins/adsense', mode: 'client' },
    { src: '~/plugins/gtag', mode: 'client' },
    { src: '~/plugins/visibility', mode: 'client' },
    { src: '~/plugins/slider', mode: 'client' },
    { src: '~/plugins/plotly', mode: 'client' },
    { src: '~/plugins/custom-components' },
    { src: '~/plugins/scrollto', mode: 'client' },
    // { src: '~/plugins/lazy-hydrate' },
    { src: '~/plugins/clicker' },
    { src: '~/plugins/cube' },
    { src: '~/plugins/modern' },
    { src: '~/plugins/http', mode: 'client' },
  ],

  modules: [
    'nuxt-i18n',
    '@nuxt/http',
    '@nuxt/content',
    '@nuxtjs/pwa',
    '@nuxtjs/redirect-module',
    '@nuxtjs/sentry',
    '@nuxtjs/sitemap',
  ],

  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/fontawesome',
    '@nuxtjs/google-fonts',
    '@nuxtjs/composition-api/module',
  ],

  components: [ {
    path: '~/components',
    pathPrefix: false,
    ignore: ['**/media-img.*', '**/lazy.*'], // loaded by plugin instead
    loader: true, // https://github.com/nuxt/components/issues/164
  } ],

  router: {
    prefetchLinks: false,
  },

  redirect: [
    { from: '^/meta$', to: '/tier-list/brawler', statusCode: 301 },
    { from: '^/meta/(.*)$', to: '/tier-list/$1', statusCode: 301 },
    { from: '^/leaderboard$', to: '/leaderboard/hours', statusCode: 301 },
    { from: '^/leaderboard/$', to: '/leaderboard/hours', statusCode: 301 },
    { from: '^/tier-list/mode/(.*)/map/(.*)/teams$', to: '/tier-list/mode/$1/map/$2', statusCode: 301 },
    { from: '^(.*)/profile/8QQ8YYRYP$', statusCode: 404 }, // threatened to sue me by mail
    { from: '^/player/(.*)$', to: '/profile/$1', statusCode: 301 },
  ],

  sentry: {
    // set $SENTRY_DSN, $SENTRY_AUTH_TOKEN, $SENTRY_ORG and $SENTRY_PROJECT
    // auth token is an organization integration auth token (developer settings)
    // with project write, release admin and org read access
    publishRelease: process.env.NODE_ENV == 'production',
    sourceMapStyle: 'source-map',
    /*
    // manually configure release for herokuish build
    webpackConfig: {
      setCommits: {
        repo: 'schneefux/brawltimeninja',
        commit: process.env.GIT_REV,
      },
    },
    config: {
      release: 'brawltimeninja@' + process.env.GIT_REV,
    },
    */
    // requires @sentry/tracing
    // enable for performance metrics
    /*
    tracing: {
      tracesSampleRate: 0.001,
    },
    */
  },

  env: {
    branch: process.env.BRANCH || '',
    release: (process.env.GIT_REV || 'dev').slice(0, 6),
  },
  publicRuntimeConfig: {
    apiUrl: (process.env.API_URL || 'https://api.brawltime.ninja').replace(/\/$/, ''), // replace trailing slash
    mediaUrl: (process.env.MEDIA_URL || 'https://media.brawltime.ninja').replace(/\/$/, ''),
    clickerUrl: (process.env.CLICKER_URL || 'https://clicker.brawltime.ninja').replace(/\/$/, ''),
    renderUrl: (process.env.RENDER_URL || 'https://render.brawltime.ninja').replace(/\/$/, ''),
    cubeUrl: (process.env.CUBE_URL || 'https://cube.brawltime.ninja').replace(/\/$/, ''),
    cubeSecret: (process.env.CUBE_SECRET || ''),
  },

  build: {
    postcss: {
      plugins: {
        'postcss-color-function': {},
      },
    },
    // https://github.com/nuxt/nuxt.js/issues/9221
    transpile: ['vega-lite', 'd3-format'],
  },

  sitemap: {
    // generated during run time
    gzip: true,
    exclude: ['/embed/**'],
    async routes() {
      const routes = []

      try {
        const events = await fetch(`${process.env.CLICKER_URL}/clicker/cube/map/query/battle_event_mode,battle_event_map?slice[trophy_season_end]=month`)
          .then(r => r.json())
        events.data.forEach((event) => {
          const modeRoute = `/tier-list/mode/${camelToKebab(event.battle_event_mode)}`
          if (!routes.includes(modeRoute)) {
            routes.push(modeRoute)
          }
          routes.push(`/tier-list/mode/${camelToKebab(event.battle_event_mode)}/map/${slugify(event.battle_event_map)}`)
        })
      } catch (err) {
        console.error('error adding events to sitemap', err)
      }

      try {
        const brawlers = await fetch(`${process.env.CLICKER_URL}/clicker/cube/map/query/brawler_name?include=brawler_name`)
          .then(r => r.json())
        brawlers.data.forEach(b => routes.push(`/tier-list/brawler/${brawlerId({ name: b.brawler_name })}`))
      } catch (err) {
        console.error('error adding brawlers to sitemap', err)
      }

      try {
        const players = await fetch(`${process.env.CLICKER_URL}/clicker/cube/battle/query/player_id?limit=1000&slice[trophy_season_end]=current&sort=-player_trophies`)
          .then(r => r.json())
        players.data.forEach(p => routes.push(`/profile/${p.player_tag}`))
      } catch (err) {
        console.error(`error adding top players to sitemap`, err)
      }

      return routes
    },
  },

  content: {
    // breaks media-img component registration
    // https://github.com/nuxt/content/issues/261
    liveEdit: false,
  },

  fontawesome: {
    // reduce size
    useLayers: false,
    useLayersText: false,
    addCss: true,
  },

  i18n: {
    seo: false,
    locales: [{
      code: 'en',
      iso: 'en-US',
      file: 'index.js',
    }, {
      code: 'de',
      iso: 'de-DE',
      file: 'index.js',
    }],
    lazy: true,
    langDir: 'lang/',
    defaultLocale: 'en',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      onlyOnRoot: true,
    },
    vueI18n: {
      fallbackLocale: 'en',
    },
  },

  tailwindcss: {
    viewer: false,
  },

  googleFonts: {
    families: {
      Roboto: true,
    },
    display: 'swap',
    download: true,
    subsets: 'latin',
  },
}
