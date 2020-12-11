<template>
  <page title="Brawl Stars Guides">
    <page-section
      v-if="faqs.length > 0"
      title="Frequently asked Questions"
      tracking-id="faq"
      page-tracking-id="guides"
    >
      <div class="flex flex-wrap justify-center">
        <card
          v-for="faq in faqs"
          :key="faq.id"
          :title="faq.title"
          :title-link="`/faq/${faq.slug}`"
          itemscope
          itemtype="http://schema.org/AnalysisNewsArticle"
          light
          sm
        >
          <p
            slot="content"
            itemprop="abstract"
          >
            {{ faq.question }}
          </p>

          <b-button
            slot="actions"
            :to="`/faq/${faq.slug}`"
            itemprop="url"
            light
            prefetch
          >
            Read
          </b-button>
        </card>
      </div>
    </page-section>

    <page-section
      title="Brawl Stars Guides"
      tracking-id="guides"
      page-tracking-id="guides"
    >
      <div class="flex flex-wrap justify-center">
        <div
          v-for="(post, index) in posts"
          :key="post.title"
          class="contents"
        >
          <client-only>
            <in-feed-adsense
              v-if="index == 3"
              data-ad-layout-key="-6f+dk+1s-h+2d"
              data-ad-client="ca-pub-6856963757796636"
              data-ad-slot="6887845661"
              class="w-full"
            ></in-feed-adsense>
          </client-only>

          <card
            :title="post.title"
            :title-link="`/blog/guides/${post.slug}`"
            itemscope
            itemtype="http://schema.org/AnalysisNewsArticle"
            light
            sm
          >
            <div
              slot="infobar"
              v-if="'image' in post"
              :style="'image' in post ? `background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${post.image}')` : ''"
              class="h-48 bg-cover bg-center"
              itemprop="thumbnailUrl"
            ></div>

            <p
              slot="content"
              itemprop="abstract"
            >
              {{ post.description }}
            </p>

            <b-button
              slot="actions"
              :to="`/blog/guides/${post.slug}`"
              itemprop="url"
              light
              prefetch
            >
              Read
            </b-button>
          </card>
        </div>
      </div>
    </page-section>
  </page>
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
  middleware: ['cached'],
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
