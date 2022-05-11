import path from 'path'

const apiUrl = (process.env.API_URL || 'https://api.brawltime.ninja').replace(/\/$/, ''); // replace trailing slash
const mediaUrl = (process.env.MEDIA_URL || 'https://media.brawltime.ninja').replace(/\/$/, '');
const renderUrl = (process.env.RENDER_URL || 'https://render.brawltime.ninja').replace(/\/$/, '');
const cubeUrl = (process.env.CUBE_URL || 'https://cube.brawltime.ninja').replace(/\/$/, '');
const traduoraUrl = (process.env.TRADUORA_URL || 'https://translate.brawltime.ninja').replace(/\/$/, '');
const managerUrl = (process.env.MANAGER_URL || 'https://manager.brawltime.ninja').replace(/\/$/, '');

export default {
  telemetry: false,
  modern: process.env.NODE_ENV == 'development' ? false : 'server',

  head: {
    titleTemplate: '%s - Brawl Time Ninja',
    bodyAttrs: {
      class: ['dark'],
    },
    script: [
      { src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6856963757796636', async: true, crossorigin: 'anonymous' },
      {
        innerHTML: '(adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1;',
        async: false,
      },
    ],
    link: [
      { rel: 'icon', href: '/icons/favicon.ico', sizes: 'any' },
      { rel: 'icon', href: '/icons/favicon.svg', type: 'image/svg+xml' },
    ],
    __dangerouslyDisableSanitizers: ['script'],
  },

  meta: {
    viewport: 'width=device-width',
    name: 'Brawl Time Ninja',
    description: 'Track Brawl Stars profile stats. Calculate your win rate, how many hours you play and other statistics. View Tier Lists for current events and get gameplay tips.',
    author: 'schneefux',
    theme_color: '#facc15', // yellow-400
  },

  pwa: {
    manifest: {
      id: '/?standalone=true',
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
    icon: false,
    workbox: {
      // FIXME depends on env variables being available at build time
      // - use *.brawltime.ninja as urlPattern instead
      runtimeCaching: [{
        urlPattern: mediaUrl + '/.*',
        handler: 'staleWhileRevalidate',
      }, {
        urlPattern: apiUrl + '/.*',
        handler: 'networkFirst',
      }, {
        urlPattern: cubeUrl + '/.*',
        handler: 'networkFirst',
      }, {
        urlPattern: managerUrl + '/.*',
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
    '~/assets/css/tailwind.css',
    '~/assets/css/transitions.css',
    ...(process.env.NODE_ENV == 'development' ? ['~/assets/css/development.css'] : []),
  ],

  plugins: [
    { src: '~/plugins/fontawesome' },
    { src: '~/plugins/persist', mode: 'client' },
    { src: '~/plugins/adsense', mode: 'client' },
    { src: '~/plugins/gtag', mode: 'client' },
    { src: '~/plugins/klicker' },
    { src: '~/plugins/modern' },
    { src: '~/plugins/http', mode: 'client' },
  ],

  modules: [
    '@nuxtjs/i18n',
    '@nuxt/http',
    '@nuxtjs/pwa',
    '@nuxtjs/sentry',
  ],

  buildModules: [
    '@nuxt/typescript-build',
    '@nuxt/postcss8',
    '@nuxtjs/composition-api/module',
  ],

  components: [ {
    path: '~/components',
    pathPrefix: false,
    loader: true, // https://github.com/nuxt/components/issues/164
  } ],

  router: {
    prefetchLinks: false,
  },

  sentry: {
    // set $SENTRY_DSN, $SENTRY_AUTH_TOKEN, $SENTRY_ORG and $SENTRY_PROJECT
    // auth token is an organization integration auth token (developer settings)
    // with project write, release admin and org read access
    publishRelease: !!process.env.SENTRY_AUTH_TOKEN,
    sourceMapStyle: 'source-map',
    // manually configure release for herokuish build
    webpackConfig: {
      setCommits: {
        repo: 'schneefux/brawltimeninja',
        commit: process.env.GIT_REV,
      },
    },
    config: {
      release: 'brawltimeninja@' + process.env.GIT_REV,
      ignoreErrors: [/enable_page_level_ads/],
    },
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
    apiUrl,
    cubeUrl,
    mediaUrl,
    renderUrl,
    managerUrl,
    traduoraUrl,
    traduoraClientId: (process.env.TRADUORA_CLIENT_ID || ''),
    traduoraSecret: (process.env.TRADUORA_SECRET || ''),
    traduoraProjectId: (process.env.TRADUORA_PROJECT_ID || ''),
    cubeSecret: (process.env.CUBE_SECRET || ''),
  },

  build: {
    loaders: {
      css: {
        // https://github.com/nuxt/postcss8/issues/24
        modules: process.env.NODE_ENV == 'development' ? false : undefined,
      },
    },
    postcss: {
      plugins: {
        'postcss-import': {},
        'postcss-color-function': {},
        'tailwindcss': {},
        'autoprefixer': {},
      },
    },
    coerjs: '3',
    // https://github.com/nuxt/nuxt.js/issues/9221
    transpile: ['vega-lite', 'd3-format', '@schneefux/klicker'],
  },

  i18n: {
    locales: [{
      code: 'en',
      iso: 'en-US',
      file: 'index.js',
    }, {
      code: 'de',
      iso: 'de-DE',
      file: 'index.js',
    }, {
      code: 'es',
      iso: 'es-ES',
      file: 'index.js',
    }, {
      code: 'ukr',
      iso: 'uk-UA',
      file: 'index.js',
    },
    ...(!!process.env.TRADUORA_PROJECT_ID ? [{
      code: 'ru',
      iso: 'ru-RU',
      file: 'index.js',
    }, {
      code: 'nl_NL',
      iso: 'nl-NL',
      file: 'index.js',
    }] : [])],
    lazy: true,
    langDir: 'lang/',
    defaultLocale: 'en',
    detectBrowserLanguage: {
      redirectOn: 'root',
      useCookie: true,
      cookieKey: 'i18n_redirected',
    },
    vueI18n: {
      fallbackLocale: 'en',
    },
  },

  serverMiddleware: [
    { path: '/klicker', handler: '~/server-middleware/klicker.ts' },
  ],

  alias: {
    // https://github.com/vueuse/vueuse/issues/1239
    '@vueuse/core': path.resolve(__dirname, 'node_modules/@vueuse/core/index.mjs'),
    '@vueuse/shared': path.resolve(__dirname, 'node_modules/@vueuse/shared/index.mjs'),
  }
}
