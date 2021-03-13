import Vue from 'vue'
import VueScrollTo from 'vue-scrollto'

// workaround for https://github.com/nuxt/nuxt.js/issues/5359
Vue.use(VueScrollTo, {
  duration: 0,
  offset: -96, // menu height
})
