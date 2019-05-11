const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  apps: [{
    name: 'web',
    port: 9990,
    script: './node_modules/nuxt/bin/nuxt.js',
    args: 'start',
    cwd: './',
    watch: false,
    exec_mode: 'cluster_mode',
    instances: 'max',
    env: {
      'NODE_ENV': 'production',
      /* server to server calls - frontend configuration is set during build */
      'API_PORT': 9991,
    },
  }, {
    name: 'api',
    port: 9991,
    script: './functions/dist/apps/api.js',
    watch: false,
    exec_mode: 'cluster_mode',
    instances: 'max',
    env: {
      'NODE_ENV': 'production',
      'CACHE_PATH': process.env.CACHE_PATH || 'cache/',
      'BRAWLSTARS_TOKEN': process.env.BRAWLSTARS_TOKEN,
      'TRACKER_URL': 'http://localhost:9992/track',
    },
  }, {
    name: 'tracker',
    port: 9992,
    script: './functions/dist/apps/tracker.js',
    watch: false,
    exec_mode: 'cluster_mode',
    instances: 'max',
    env: {
      'NODE_ENV': 'production',
      'DATABASE_URI': process.env.DATABASE_URI,
    },
  }],
  deploy: {
    production: {
      key: process.env.PROD_SSHKEY,
      user: process.env.PROD_USER,
      host: process.env.PROD_HOST,
      ref: 'origin/dev',
      repo: 'https://github.com/schneefux/brawlstarstimeninja',
      path: process.env.PROD_PATH,
      'post-setup':
        'echo DATABASE_URI=\'' + process.env.PROD_DATABASE_URI + '\' >> .env && ' +
        'echo BRAWLSTARS_TOKEN=\'' + process.env.PROD_BRAWLSTARS_TOKEN + '\' >> .env',
      'post-deploy':
        'npm install && ' +
        'export API_URL_BROWSER=\'' + process.env.PROD_APIURL + '\' && ' +
        'npm run generate:api && ' +
        'npm run build:functions && ' +
        'npm run build && ' +
        'pm2 startOrRestart ecosystem.config.js',
    },
  },
}
