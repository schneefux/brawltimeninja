<template>
  <b-page title="Brawl Stars Guides">
    <div
      v-if="posts != undefined"
      class="flex flex-wrap justify-center"
    >
      <div
        v-for="(post, index) in posts"
        :key="post.title"
        class="contents"
      >
        <!--
        <client-only>
          <in-feed-adsense
            v-if="index == 3"
            data-ad-layout-key="-6f+dk+1s-h+2d"
            data-ad-client="ca-pub-6856963757796636"
            data-ad-slot="6887845661"
            class="w-full"
          ></in-feed-adsense>
        </client-only>
        -->

        <b-card
          :title="post.title"
          :link="`/blog/guides/${post.slug}`"
          class="mx-4 my-4 w-full max-w-md"
          itemscope
          itemtype="http://schema.org/AnalysisNewsArticle"
          light
        >
          <span
            slot="preview"
            class="text-gray-400 text-sm"
          >{{ post.createdAt }}</span>
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
            primary
            md
          >
            Read
          </b-button>
        </b-card>
      </div>
    </div>
  </b-page>
</template>

<script lang="ts">
import { computed, defineComponent, useAsync } from '@nuxtjs/composition-api'
import { format, parseISO } from 'date-fns'
import { requestStatic } from '~/composables/content'
import { TocEntry } from '~/model/Web'

export default defineComponent({
  nuxtI18n: {
    locales: ['en'],
  },
  middleware: ['cached'],
  setup() {
    const toc = useAsync<TocEntry[]>(() => requestStatic('/content/guides/toc.json').then(r => JSON.parse(r)), 'toc-guides')

    const posts = computed(() => {
      if (toc.value == undefined) {
        return undefined
      }

      return toc.value.map(p => ({
        ...p,
        createdAt: format(parseISO(p.createdAt), 'PP'),
      }))
    })

    return {
      posts,
    }
  },
})
</script>
