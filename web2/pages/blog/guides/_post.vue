<template>
  <b-page class="flex justify-center">
    <article-card
      v-if="post != null"
      :document="post"
    ></article-card>
  </b-page>
</template>

<script lang="ts">
import { useCacheHeaders, useMeta } from '@/composables/compat'
import { defineComponent } from 'vue'
import { usePost } from '~/composables/content'

export default defineComponent({
  async setup() {
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

    const post = await usePost('guides')

    return {
      post,
    }
  },
})
</script>
