<template>
  <split-page title="Brawl Stars Guides">
    <div
      v-if="toc"
      class="flex flex-wrap justify-center"
    >
      <div
        v-for="post in toc"
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
          <template v-if="post.createdAt" v-slot:preview>
            <absolute-time
              :timestamp="post.createdAt"
              class="text-gray-400 text-sm"
              format-str="PP"
            ></absolute-time>
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
  </split-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useCacheHeaders } from '~/composables/compat'
import toc from '~/assets/content/guides/toc.json'

export default defineComponent({
  setup() {
    useCacheHeaders()

    return {
      toc,
    }
  },
})
</script>
