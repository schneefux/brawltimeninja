import Vue from 'vue'
import MediaImg from '~/components/media-img.vue'
import Lazy from '~/components/lazy.vue'
import AccordeonCard from '~/components/accordeon-card.vue'
import KvTable from '~/components/kv-table.vue'
import Page from '~/components/page.vue'
import PageDashboard from '~/components/page-dashboard.vue'
import { BShimmer, BButton, BCard, BSelect, BLightbox, BCheckbox, BRadio, BWrappedComponent } from '~/klicker/components'
import CardContent from '~/klicker/components/ui/card-content.vue'
import BrawlerLink from '~/components/brawler/brawler-link.vue'
import BrawlerTeam from '~/components/brawler/brawler-team.vue'

// add functional components globally so that they are available
// as children in functional components and in blog posts
// alternatively, add an explicit local import
// see https://github.com/nuxt/components/issues/159
// -> fixes `Cannot read property 'toLowerCase' of undefined at emptyNodeAt`
Vue.component('media-img', MediaImg)
Vue.component('lazy', Lazy)
Vue.component('accordeon-card', AccordeonCard)
Vue.component('kv-table', KvTable)
Vue.component('page', Page)
Vue.component('page-dashboard', PageDashboard)
Vue.component('b-shimmer', BShimmer)
Vue.component('brawler-link', BrawlerLink)
Vue.component('brawler-team', BrawlerTeam)
Vue.component('b-card', BCard)
Vue.component('b-button', BButton)
Vue.component('b-select', BSelect)
Vue.component('b-lightbox', BLightbox)
Vue.component('b-checkbox', BCheckbox)
Vue.component('b-radio', BRadio)
Vue.component('card-content', CardContent) // TODO don't make b-card a function component so it can import this
Vue.component('b-wrapped-component', BWrappedComponent) // TODO don't make b-card-content a function component so it can import this
