<template>
  <b-page title="Brawl Stars Guides">
    <div
      v-if="posts != undefined"
      class="flex flex-wrap justify-center"
    >
      <div
        v-for="post in posts"
        :key="post.title"
        class="contents"
      >
        <b-card
          :title="post.title"
          :link="localePath(`/blog/guides/${post.slug}`)"
          class="mx-4 my-4 w-full max-w-md"
          itemscope
          itemtype="http://schema.org/AnalysisNewsArticle"
          light
        >
          <template v-slot:preview>
            <span class="text-gray-400 text-sm" >{{ post.createdAt }}</span>
          </template>

          <template
            v-if="'image' in post"
            v-slot:infobar
          >
            <div
              :style="'image' in post ? `background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${post.image}')` : ''"
              class="h-48 bg-cover bg-center"
              itemprop="thumbnailUrl"
            ></div>
          </template>

          <template v-slot:content>
            <p itemprop="abstract">
              {{ post.description }}
            </p>
          </template>

          <template v-slot:actions>
            <b-button
              :to="`/blog/guides/${post.slug}`"
              itemprop="url"
              primary
              md
            >
              Read
            </b-button>
          </template>
        </b-card>
      </div>
    </div>
  </b-page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { format, parseISO } from 'date-fns'
import { TocEntry } from '~/model/Web'
import { useAsync, useCacheHeaders } from '@/composables/compat'

export default defineComponent({
  setup() {
    const toc = useAsync<{ default: TocEntry[] }>(() => import('~/assets/content/guides/toc.json'), 'toc-guides')

    const posts = computed(() => {
      if (toc.value == undefined) {
        return undefined
      }

      return toc.value.default.map(p => ({
        ...p,
        createdAt: format(parseISO(p.createdAt), 'PP'),
      }))
    })

    useCacheHeaders()

    return {
      posts,
    }
  },
})
</script>
