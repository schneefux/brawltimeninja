<template>
  <div class="container mx-auto py-4 px-2">
    <article
      class="bg-grey-lighter py-8 px-6 my-8 text-black"
      itemscop
      itemtype="http://schema.org/AnalysisNewsArticle"
    >
      <div
        v-show="'image' in post"
        :style="'image' in post ? `background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${post.image}')` : ''"
        class="h-48 bg-cover bg-center mb-6"
        itemprop="thumbnailUrl"
      />
      <h1 class="text-4xl font-semibold">
        <span class="text-primary-dark" itemprop="headline">{{ post.title }}</span>
        <span class="text-sm block mt-4 md:float-right align-middle text-grey-darker" rel="author">{{ post.author }}</span>
      </h1>
      <div class="mt-2">
        <nuxt-content
          :document="post"
          ref="content"
          itemprop="articleBody"
        />

        <div
          v-show="lightboxOpen"
          class="fixed inset-0 z-50 bg-black bg-opacity-75"
        >
          <button
            class="absolute top-0 right-0 mr-10 mt-4 text-white text-5xl"
            @click="lightboxOpen = false"
          >
            &times;
          </button>
          <div
            class="h-full flex justify-center items-center"
            @click.self="lightboxOpen = false"
          >
            <img
              class="max-h-full max-w-full"
              :src="lightboxImage"
            >
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Post } from '../../../model/Web'

export default Vue.extend({
  name: 'PostPage',
  head() {
    const post = this.post as any
    const description = `Brawl Stars Guides written by ${post.author}. ${post.description}`
    return {
      title: post.title,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      post: undefined as undefined|Post,
      lightboxOpen: false,
      lightboxImage: '',
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
  mounted() {
    this.$refs.content.querySelectorAll('img.lightbox').forEach((img) => {
      img.addEventListener('click', () => {
        this.lightboxImage = img.src
        this.lightboxOpen = true
      })
    })
  },
})
</script>

<style scoped>
.nuxt-content {
  @apply leading-normal;
}

.nuxt-content /deep/ h2 {
  @apply text-3xl mt-3 mb-2;
}

.nuxt-content /deep/ h3 {
  @apply text-2xl mt-2 mb-1;
}

.nuxt-content /deep/ p {
  @apply mt-3;
}

.nuxt-content /deep/ ul {
  @apply list-disc list-inside;
}

.nuxt-content /deep/ li {
  @apply mt-2;
}

.nuxt-content /deep/ a {
  @apply underline text-primary-dark;
}
</style>
