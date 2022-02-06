<template>
  <div class="dashboard dashboard--responsive dashboard--responsive-stretch">
    <c-dashboard-cell :rows="1" :columns="3">
      <b-card
        v-for="post in articles"
        :key="post.id"
        :title="post.title"
        :link="`/blog/${topic}/${post.slug}`"
        :icon="post.mode != undefined ? `/modes/${post.mode}/icon` : undefined"
        full-height
        light
      >
        <template v-slot:icon="data">
          <media-img-icon v-bind="data"></media-img-icon>
        </template>

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
    </c-dashboard-cell>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { CDashboardCell } from '@schneefux/klicker/components'

interface Article {
  id: string
  title: string
  slug: string
  mode: string
  description: string
}

export default Vue.extend({
  components: {
    CDashboardCell,
  },
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
