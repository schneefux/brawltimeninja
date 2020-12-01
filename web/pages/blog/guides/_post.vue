<template>
  <div class="page container flex justify-center">
    <article-card
      :title="post.title"
      :image="post.image"
      :author="post.author"
      :document="post"
    ></article-card>
  </div>
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
  middleware: ['cached'],
  data() {
    return {
      post: undefined as undefined|Post,
    }
  },
  async asyncData({ params, $content, error }: any) {
    const post = await $content(`guides/${params.post}`).fetch() as Post

    if (post == undefined) {
      return error({ statusCode: 404, message: 'Post not found' })
    }

    return {
      post,
    }
  },
})
</script>
