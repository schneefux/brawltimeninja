<template>
  <b-page class="flex justify-center">
    <article-card
      :document="post"
    ></article-card>
  </b-page>
</template>

<script lang="ts">
import Vue from 'vue'
import { MetaInfo } from 'vue-meta'
import { Post } from '~/model/Web'

export default Vue.extend({
  head(): MetaInfo {
    if (this.post == undefined) {
      return {}
    }
    const description = `Brawl Stars Guides written by ${this.post.author}. ${this.post.description}`
    return {
      title: this.post.title,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    title: 'Guides',
    screen: 'guides',
  },
  nuxtI18n: {
    locales: ['en'],
  },
  middleware: ['cached'],
  data() {
    return {
      post: undefined as undefined|Post,
    }
  },
  async asyncData({ params, $content, error }: any) {
    try {
      const post = await $content(`guides/${params.post}`).fetch() as Post
      return {
        post,
      }
    } catch {
      error({ statusCode: 404, message: 'Post not found' })
      return {}
    }
  },
})
</script>
