<template>
  <b-page class="flex justify-center">
    <article-card
      v-if="post != null"
      :document="post"
    ></article-card>
  </b-page>
</template>

<script lang="ts">
import { useCacheHeaders, useMeta, useRoute } from '@/composables/compat'
import { defineComponent } from 'vue'
import { useContent } from '~/composables/content'

export default defineComponent({
  setup() {
    const route = useRoute()
    const { post } = useContent('guides/' + route.value.params.post)

    useCacheHeaders()
    useMeta(() => {
      if (post.value == undefined) {
        return {}
      }
      const description = `Brawl Stars Guides written by ${post.value.author}. ${post.value.description}`
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
