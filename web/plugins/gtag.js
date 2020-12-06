import Vue from 'vue'
import VueGtag from 'vue-gtag'

export default ({ app }) => {
  Vue.use(VueGtag, {
    config: {
      id: 'G-8GGHZC6QR2',
      optimize_id: 'OPT-PWZ78LC',
    },
    includes: [ {
      // old property
      id: 'UA-137233906-1',
    } ],
    // toggled in layout.vue
    enabled: app.store.state.adsAllowed == true,
  }, app.router)
}
