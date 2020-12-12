import Vue from 'vue'
import MediaImg from '~/components/media-img'
import Lazy from '~/components/lazy'
import WrappedComponent from '~/components/wrapped-component'
import Card from '~/components/card.vue'
import AccordeonCard from '~/components/accordeon-card.vue'
import CardContent from '~/components/card-content.vue'

// globally enable base components
// so that they are available in functional components
// and in blog posts
Vue.component('media-img', MediaImg)
Vue.component('lazy', Lazy)
Vue.component('wrapped-component', WrappedComponent)
Vue.component('card', Card)
Vue.component('accordeon-card', AccordeonCard)
Vue.component('card-content', CardContent)
