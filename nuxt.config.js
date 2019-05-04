import path from 'path'
import PurgecssPlugin from 'purgecss-webpack-plugin'
import glob from 'glob-all'

import payload from './store/payload.json'

class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-z0-9-:/]+/g) || []
  }
}

export default {
  mode: 'universal',

  head: {
    title: 'Brawlstars Time Ninja',
  },

  meta: {
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
    name: 'Brawlstars Time Ninja',
    description: 'Brawlstars Time Ninja - Check time spent on Brawlstars and player statistics',
    author: 'schneefux',
    theme_color: '#3490dc', // primary
  },

  loading: { color: '#ffed4a' }, // secondary

  css: [
    '~/assets/css/tailwind.css',
    '~/assets/css/app.css',
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

      if (!ctx.isDev) {
        config.plugins.push(
          new PurgecssPlugin({
            paths: glob.sync([
              path.join(__dirname, './pages/**/*.vue'),
              path.join(__dirname, './layouts/**/*.vue'),
              path.join(__dirname, './components/**/*.vue'),
              path.join(__dirname, './store/payload.json'),
            ]),
            extractors: [ {
              extractor: TailwindExtractor,
              extensions: ['vue', 'json'],
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

  generate: {
    fallback: true,
    routes() {
      const routes = []

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
