import Vue from 'vue'
import MediaImg from '~/components/media-img'
import Lazy from '~/components/lazy'
import WrappedComponent from '~/components/wrapped-component'
import Card from '~/components/card.vue'
import AccordeonCard from '~/components/accordeon-card.vue'
import CardContent from '~/components/card-content.vue'
import KvTable from '~/components/kv-table.vue'
import Page from '~/components/page.vue'
import PageDashboard from '~/components/page-dashboard.vue'
import Shimmer from '~/components/shimmer.vue'
import HorizontalScroller from '~/components/horizontal-scroller.vue'
import BrawlerLink from '~/components/brawler/brawler-link.vue'
import BrawlerTeam from '~/components/brawler/brawler-team.vue'
import BrawlerCard from '~/components/brawler/brawler-card.vue'
import BButton from '~/components/ui/b-button.vue'

// add functional components globally so that they are available
// as children in functional components and in blog posts
// alternatively, add an explicit local import
// see https://github.com/nuxt/components/issues/159
// -> fixes `Cannot read property 'toLowerCase' of undefined at emptyNodeAt`
Vue.component('media-img', MediaImg)
Vue.component('lazy', Lazy)
Vue.component('wrapped-component', WrappedComponent)
Vue.component('card', Card)
Vue.component('accordeon-card', AccordeonCard)
Vue.component('card-content', CardContent)
Vue.component('kv-table', KvTable)
Vue.component('page', Page)
Vue.component('page-dashboard', PageDashboard)
Vue.component('shimmer', Shimmer)
Vue.component('brawler-link', BrawlerLink)
Vue.component('brawler-team', BrawlerTeam)
Vue.component('brawler-card', BrawlerCard)
Vue.component('horizontal-scroller', HorizontalScroller)
Vue.component('b-button', BButton)
