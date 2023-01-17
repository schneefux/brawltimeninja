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
import { useCacheHeaders, useMeta } from '@/composables/compat'
import { useContent } from '~/composables/content'
import ArticleCard from '~/components/article-card.vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  components: {
    ArticleCard,
  },
  setup() {
    const route = useRoute()
    const { post } = useContent('faq/' + route.params.faq)

    useCacheHeaders()
    useMeta(() => {
      if (post.value == undefined) {
        return {}
      }
      const description = `${post.value.question}`
      return {
        title: post.value.title,
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
        ]
      }
    })

    return {
      post,
    }
  },
})
</script>
