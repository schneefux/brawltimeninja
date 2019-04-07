import path from 'path'
import PurgecssPlugin from 'purgecss-webpack-plugin'
import glob from 'glob-all'

class TaiwindExtractor {
  static extract(content) {
    return content.match(/[A-z0-9-:/]+/g) || []
  }
}

export default {
  mode: 'universal',

  head: {
    title: 'Online Time Ninja',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Brawl Stars Time Ninja - Check time spent on Brawl Stars and player statistics' },
      { hid: 'og:description', name: 'og:description', content: 'Brawl Stars Time Ninja - Check time spent on Brawl Stars and player statistics' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  loading: { color: '#fff' },

  css: [
    '~/assets/css/tailwind.css'
  ],

  plugins: [
    { src: '~/plugins/persist', mode: 'client' },
    { src: '~/plugins/adsense', mode: 'client' },
    { src: '~/plugins/analytics', mode: 'client' },
  ],

  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/pwa'
  ],

  router: {
  },

  axios: {
  },

  build: {
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }

      // required for nuxtServerInit lambda bypass
      config.externals = ['fs', 'net', 'encoding']

      if (!ctx.isDev) {
        config.plugins.push(
          new PurgecssPlugin({
            paths: glob.sync([
              path.join(__dirname, './pages/**/*.vue'),
              path.join(__dirname, './layouts/**/*.vue'),
              path.join(__dirname, './components/**/*.vue'),
            ]),
            extractors: [ {
              extractor: TaiwindExtractor,
              extensions: ['vue'],
            } ],
            whitelist: ['html', 'body', 'nuxt-progress'],
          })
        )
      }
    },
    extractCSS: true,
    postcss: {
      plugins: {
        tailwindcss: path.resolve('./tailwind.js')
      },
      preset: { autoprefixer: { grid: true } },
    },
  },

  env: {
    app: process.env.NINJA_APP || 'brawlstars',
  },

  generate: {
    fallback: true,
    async routes() {
      const lambda = require('./functions/dist/api.js')
      // bypass any server setup and call the lambda directly
      const $get = requestPath => new Promise((resolve, reject) => lambda.handler({
        path: '/.netlify/functions' + requestPath,
        httpMethod: 'GET',
        headers: {},
        queryStringParameters: {},
        body: '',
        isBase64Encoded: false,
      }, {
        succeed: response => resolve(JSON.parse(response.body)),
        fail: reject,
      }, () => {}))

      const app = process.env.NINJA_APP || 'brawlstars'
      const labels = await $get(`/api/${app}/labels`)
      const shards = await $get(`/api/${app}/shards`)
      const featuredPlayers = await $get(`/api/${app}/featured-players`)

      return [{
        route: '/',
        payload: { labels, shards, featuredPlayers },
      }]
    },
  },
}
