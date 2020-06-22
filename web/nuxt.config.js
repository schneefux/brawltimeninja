import path from 'path'
import axios from 'axios'

import { camelToKebab } from './lib/util'
import payload from './store/payload.json'

export default {
  mode: 'universal',

  head: {
    titleTemplate: '%s - Brawl Time Ninja',
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
      // prefix all cache keys with release id
      // write release id to a custom option
      // -> sw.js changes on deploy
      cacheNames: {
        prefix: 'brawltimeninja@' + process.env.GIT_REV,
      },
      release: 'brawltimeninja@' + process.env.GIT_REV,
      // custom service worker with cache busting on release
      swTemplate: process.NODE_ENV == 'production' ? path.resolve(__dirname, 'static/sw-template.js') : undefined,
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
  ],

  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/redirect-module',
    '@nuxtjs/sitemap',
    //'@nuxtjs/sentry',
  ],

  buildModules: ['@nuxt/typescript-build'],

  router: {
  },

  axios: {
  },

  redirect: [
    { from: '^/meta$', to: '/tier-list/brawler', statusCode: 301 },
    { from: '^/meta/(.*)$', to: '/tier-list/$1', statusCode: 301 },
  ],

  /*
  sentry: {
    // set $SENTRY_DSN, $SENTRY_AUTH_TOKEN, $SENTRY_ORG and $SENTRY_PROJECT
    // auth token is an organization integration auth token (developer settings)
    // with project write, release admin and org read access
    config: {
      ignoreErrors: [/frameElement/],
      release: 'brawltimeninja@' + process.env.GIT_REV,
    },
    disabled: process.env.NODE_ENV == 'development',
    publishRelease: true,
    webpackConfig: {
      setCommits: {
        repo: 'schneefux/brawltimeninja',
        commit: process.env.GIT_REV,
      },
    },
  },
  */

  env: {
    branch: process.env.BRANCH || '',
    mediaUrl: (process.env.MEDIA_URL || '').replace(/\/$/, ''), // replace trailing slash
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
              path.join(__dirname, './store/payload.json'),
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

      const modes = []
      payload.events.forEach((event) => {
        if (!modes.includes(event.mode)) {
          const mode = camelToKebab(event.mode)
          modes.push(event.mode)
          routes.push(`/tier-list/mode/${mode}`)
        }
        routes.push(`/tier-list/map/${event.id}`)
      });

      [...Object.entries(payload.blog)].forEach(([topic, posts]) => {
        routes.push(`/blog/${topic}`)
        posts.forEach(post => routes.push(`/blog/${topic}/${post.id}`))
      })

      try {
        const topTrophies = await axios.get('https://api.brawltime.ninja/api/leaderboard/trophies')
        topTrophies.data.forEach(({ tag }) => routes.push(`/player/${tag}`))
      } catch (err) { }

      try {
        const topHours = await axios.get('https://api.brawltime.ninja/api/leaderboard/hours')
        topHours.data.forEach(({ tag }) => routes.push(`/player/${tag}`))
      } catch (err) { }

      return routes
    },
  },

  generate: {
    fallback: true,
    routes() {
      const routes = []

      // do not include meta pages because they require dynamic data
      routes.push({
        route: '/',
      });

      [...Object.entries(payload.blog)].forEach(([topic, posts]) => {
        routes.push({
          route: `/blog/${topic}`,
        })
        posts.forEach(post => routes.push({
          route: `/blog/${topic}/${post.id}`,
        }))
      })

      return routes
    },
  },
}
