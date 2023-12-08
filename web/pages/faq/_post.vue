<template>
  <b-page class="flex justify-center">
    <article-card
      v-if="post != undefined"
      :title="post.title"
      :document="post"
      author="schneefux"
    ></article-card>
  </b-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useCacheHeaders, useMeta } from '~/composables/compat'
import { usePost } from '~/composables/content'
import ArticleCard from '~/components/article-card.vue'

export default defineComponent({
  components: {
    ArticleCard,
  },
  async setup() {
    useCacheHeaders()

    const post = await usePost('faq')

    useMeta(() => {
      if (post.value == undefined) {
        return {}
      }
      return {
        title: post.value.title,
        meta: [
          { hid: 'description', name: 'description', content: post.value.question },
        ]
      }
    })

    return {
      post,
    }
  },
})
</script>
