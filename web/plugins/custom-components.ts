import Vue from 'vue'
import MediaImg from '~/components/media-img.vue'

// add functional components globally so that they are available
// as children in functional components and in blog posts
// alternatively, add an explicit local import
// see https://github.com/nuxt/components/issues/159
// -> fixes `Cannot read property 'toLowerCase' of undefined at emptyNodeAt`
Vue.component('media-img', MediaImg)
