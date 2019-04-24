<template>
  <div class="container mx-auto py-4 px-2">
    <article class="bg-grey-lighter py-8 px-6 my-8 text-black">
      <div
        v-if="post.image"
        :style="`background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${post.image}')`"
        class="h-48 bg-cover bg-center mb-6"
      >
      </div>
      <h1>
        <span class="text-primary-dark">{{ post.title }}</span>
        <span class="text-sm block mt-4 md:float-right align-middle text-grey-darker">{{ post.author }}</span>
      </h1>
      <div class="mt-2">
        <p
          v-html="post.content"
          ref="markdown"
          class="markdown"
        ></p>

        <div
          v-show="lightboxOpen"
          class="fixed pin"
          style="background-color: rgba(0, 0, 0, 0.75)"
        >
          <button
            class="absolute pin-t pin-r mr-10 mt-4 text-white text-5xl"
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
export default {
  name: 'TopicPage',
  data() {
    return {
      lightboxOpen: false,
      lightboxImage: '',
    }
  },
  asyncData({ params, store, error }) {
    const posts = store.state.blog[params.topic]
    if (posts === undefined) {
      error({ statusCode: 404, message: 'Category does not exist' })
    }

    const post = posts.filter(({ id }) => id === params.post)
    if (post.length === 0) {
      error({ statusCode: 404, message: 'Post does not exist' })
    }

    return {
      post: post[0],
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

<style>
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
