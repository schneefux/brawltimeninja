import Vue from 'vue'
import VueAnalytics from 'vue-analytics'

export default ({ app, env }) => {
  Vue.use(VueAnalytics, {
    id: 'UA-137233906-1',
    router: app.router,
    set: [
      { field: 'dimension1', value: env.branch },
    ],
  })
}
