<template>
  <div class="flex flex-wrap justify-center">
    <b-card
      v-for="post in articles"
      :key="post.id"
      :title="post.title"
      :title-link="`/blog/${topic}/${post.slug}`"
      :icon="post.mode != undefined ? `/modes/${post.mode}/icon` : undefined"
      full-height
      light
      sm
    >
      <p slot="content">
        {{ post.description }}
      </p>

      <b-button
        slot="actions"
        :to="`/blog/${topic}/${post.slug}`"
        primary
        prefetch
        sm
      >{{ $t('action.read') }}</b-button>
    </b-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

interface Article {
  id: string
  title: string
  slug: string
  mode: string
  description: string
}

export default Vue.extend({
  props: {
    topic: {
      type: String,
      required: true
    },
    limit: {
      type: Number,
      default: 3
    },
  },
  data() {
    return {
      articles: [] as Article[],
    }
  },
  watch: {
    topic: '$fetch',
    limit: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const articles = await this.$content(this.topic)
      .sortBy('createdAt', 'desc')
      .limit(this.limit)
      .fetch()
    this.articles = articles
      .map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        mode: a.mode,
        description: a.description,
      }))
  },
})
</script>
