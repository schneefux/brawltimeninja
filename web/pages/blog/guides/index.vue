<template>
  <div class="container page">
    <div
      v-if="faqs.length > 0"
      class="section-heading"
    >
      <h1 class="page-h1">
        Frequently asked Questions
      </h1>
    </div>

    <div
      v-if="faqs.length > 0"
      class="section flex flex-wrap justify-center"
    >
      <div
        v-for="faq in faqs"
        :key="faq.id"
        class="card-wrapper"
      >
        <article
          class="link-card w-full md:w-80 h-full"
          itemscope
          itemtype="http://schema.org/AnalysisNewsArticle"
        >
          <nuxt-link
            :to="`/faq/${faq.slug}`"
            class="link-light"
            itemprop="url"
          >
            <h2 class="page-h2">
              <span itemprop="headline">{{ faq.title }}</span>
            </h2>
          </nuxt-link>
          <p class="mt-3" itemprop="abstract">
            {{ faq.question }}
          </p>
        </article>
      </div>
    </div>

    <div class="section-heading">
      <h1 class="page-h1">
        Brawl Stars Guides
      </h1>
    </div>

    <div class="section">
      <div
        v-for="(post, index) in posts"
        :key="post.title"
      >
        <InFeedAdsense
          v-if="index == 3"
          data-ad-layout-key="-6f+dk+1s-h+2d"
          data-ad-client="ca-pub-6856963757796636"
          data-ad-slot="6887845661"
        />

        <article
          class="link-card my-4"
          itemscope
          itemtype="http://schema.org/AnalysisNewsArticle"
        >
          <nuxt-link
            :to="`/blog/guides/${post.slug}`"
            class="link-light"
            itemprop="url"
          >
            <h2 class="text-2xl font-semibold">
              <span itemprop="headline">{{ post.title }}</span>
              <span class="text-sm block mt-1 md:float-right align-middle text-gray-700" rel="author">{{ post.author }}</span>
            </h2>
          </nuxt-link>
          <p class="mt-3" itemprop="abstract">
            {{ post.description }}
          </p>
          <div
            v-show="'image' in post"
            :style="'image' in post ? `background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${post.image}')` : ''"
            class="h-48 bg-cover bg-center mt-6"
            itemprop="thumbnailUrl"
          />
        </article>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { IContentDocument } from '@nuxt/content/types/content'
import Vue from 'vue'
import { Post } from '../../../model/Web'

export default Vue.extend({
  head() {
    return {
      title: 'Guides',
    }
  },
  data() {
    return {
      posts: [] as Post[],
      faqs: [] as IContentDocument[],
    }
  },
  async asyncData({ $content }: any) {
    const posts = await $content('guides').sortBy('createdAt', 'desc').fetch() as Post[]
    const faqs = await $content('faq').sortBy('createdAt', 'desc').fetch()
    return {
      posts,
      faqs,
    }
  },
})
</script>

<style scoped>
.markdown {
  @apply leading-normal;
}

.markdown h2 {
  @apply mt-3 mb-2;
}

.markdown h3 {
  @apply mt-2 mb-1;
}
</style>
