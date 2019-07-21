<template>
  <div class="container mx-auto py-4 px-2">
    <h1 class="text-4xl font-semibold mx-2 mt-2 capitalize">
      {{ topic }}
    </h1>
    <div
      v-for="(post, index) in posts"
      :key="post.title"
    >
      <InFeedAdsense
        v-if="ads && index == 3"
        data-ad-layout-key="-6f+dk+1s-h+2d"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6887845661"
      />

      <article class="link-card">
        <nuxt-link
          :to="`/blog/${topic}/${post.id}`"
          class="link-light"
        >
          <h2 class="text-2xl font-semibold">
            <span>{{ post.title }}</span>
            <span class="text-sm block mt-1 md:float-right align-middle text-grey-darker">{{ post.author }}</span>
          </h2>
        </nuxt-link>
        <p class="mt-3">
          {{ post.description }}
        </p>
        <div
          v-if="post.image"
          :style="`background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${post.image}')`"
          class="h-48 bg-cover bg-center mt-6"
        />
      </article>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'TopicPage',
  head() {
    return {
      title: this.topic.charAt(0).toUpperCase() + this.topic.slice(1),
    }
  },
  computed: {
    posts() {
      return this.blog[this.topic]
    },
    ...mapState({
      blog: state => state.blog,
      ads: state => state.adsEnabled,
    }),
  },
  asyncData({ params }) {
    return {
      topic: params.topic,
    }
  },
}
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
