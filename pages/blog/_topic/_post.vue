<template>
  <div class="container mx-auto py-4 px-2">
    <article class="bg-grey-lighter py-8 px-6 my-8 text-black">
      <div
        v-if="post.image"
        :style="`background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${post.image}')`"
        class="h-48 bg-cover bg-center mb-6"
      />
      <h1 class="text-4xl font-semibold">
        <span class="text-primary-dark">{{ post.title }}</span>
        <span class="text-sm block mt-4 md:float-right align-middle text-grey-darker">{{ post.author }}</span>
      </h1>
      <div class="mt-2">
        <div
          ref="markdown"
          class="markdown"
          v-html="post.content"
        />

        <div
          v-show="lightboxOpen"
          class="fixed inset-0 z-50"
          style="background-color: rgba(0, 0, 0, 0.75)"
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

<script>
import { mapState } from 'vuex'

export default {
  name: 'PostPage',
  head() {
    const description = `Brawl Stars Guides written by ${this.post.author}. ${this.post.description}`
    return {
      title: this.post.title,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      lightboxOpen: false,
      lightboxImage: '',
    }
  },
  computed: {
    post() {
      return this.blog[this.topic]
        .find(({ id }) => id === this.id)
    },
    ...mapState({
      blog: state => state.blog,
      ads: state => state.adsEnabled,
    }),
  },
  validate({ store, params }) {
    return params.topic in store.state.blog &&
      store.state.blog[params.topic].find(({ id }) => id === params.post) !== undefined
  },
  asyncData({ params }) {
    return {
      topic: params.topic,
      id: params.post,
    }
  },
  mounted() {
    this.$refs.markdown.querySelectorAll('img.lightbox').forEach((img) => {
      img.addEventListener('click', () => {
        this.lightboxImage = img.src
        this.lightboxOpen = true
      })
    })
  },
}
</script>

<style scoped>
.markdown {
  @apply leading-normal;
}

.markdown /deep/ h2 {
  @apply text-3xl mt-3 mb-2;
}

.markdown /deep/ h3 {
  @apply text-2xl mt-2 mb-1;
}

.markdown /deep/ p {
  @apply mt-3;
}

.markdown /deep/ li {
  @apply mt-2;
}

.markdown /deep/ a {
  @apply underline text-primary-dark;
}
</style>
