import Vue from 'vue'
import VueAnalytics from 'vue-analytics'

export default ({ app }) => {
  Vue.use(VueAnalytics, {
    id: 'UA-137233906-1',
    router: app.router,
    // enabled in layout.vue
    disabled: app.store.state.adsAllowed !== true,
  })
}
