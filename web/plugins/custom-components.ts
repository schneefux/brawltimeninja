import Vue from 'vue'
import MediaImg from '~/components/media-img.vue'
import AccordeonCard from '~/components/accordeon-card.vue'
import KvTable from '~/components/kv-table.vue'
import Page from '~/components/page.vue'
import PageDashboard from '~/components/page-dashboard.vue'

// add functional components globally so that they are available
// as children in functional components and in blog posts
// alternatively, add an explicit local import
// see https://github.com/nuxt/components/issues/159
// -> fixes `Cannot read property 'toLowerCase' of undefined at emptyNodeAt`
Vue.component('media-img', MediaImg)
Vue.component('accordeon-card', AccordeonCard)
Vue.component('kv-table', KvTable)
Vue.component('page', Page)
Vue.component('page-dashboard', PageDashboard)
