<template>
  <div class="flex flex-wrap justify-center">
    <article
      class="card-wrapper w-full md:w-1/2 lg:w-1/3"
      v-for="post in posts"
      :key="post.id"
    >
      <div class="card bg-white h-full">
        <div class="card-content">
          <nuxt-link
            :to="`/blog/${topic}/${post.id}`"
            class="no-underline"
          >
            <img
              v-if="post.mode != undefined"
              class="h-6 float-right mx-2"
              :src="require(`~/assets/images/mode/icon/${post.mode.toLowerCase().replace(' ', '')}_optimized.png`)"
            >
            <h3 class="card-header text-primary-dark">
              {{ post.title }}
            </h3>
          </nuxt-link>
          <p class="mt-2 text-grey-darkest">
            {{ post.description }}
          </p>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
export default {
  name: 'Blogroll',
  props: {
    topic: {
      type: String,
      required: true
    },
    posts: {
      type: Array,
      required: true
    },
  },
}
</script>
