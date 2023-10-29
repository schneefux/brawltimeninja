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

    const post = await usePost('guides')

    useMeta(() => {
      if (post.value == undefined) {
        return {}
      }
      return {
        title: post.value.title,
        meta: [
          { hid: 'description', name: 'description', content: `Brawl Stars Guides written by ${post.value.author}. ${post.value.description}` },
        ]
      }
    })

    return {
      post,
    }
  },
})
</script>
