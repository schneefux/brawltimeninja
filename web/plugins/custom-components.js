import Vue from 'vue'
import MediaImg from '~/components/media-img'
import Lazy from '~/components/lazy'
import FastLink from '~/components/fast-link'
import Accordeon from '~/components/accordeon'
import Card from '~/components/card.vue'
import CardContent from '~/components/card-content.vue'

// globally enable base components
// so that they are available in functional components
// and in blog posts
Vue.component('media-img', MediaImg)
Vue.component('lazy', Lazy)
Vue.component('fast-link', FastLink)
Vue.component('accordeon', Accordeon)
Vue.component('card', Card)
Vue.component('card-content', CardContent)
