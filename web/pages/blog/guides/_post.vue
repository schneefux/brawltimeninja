<template>
  <b-page class="flex justify-center">
    <article-card
      v-if="post != null"
      :document="post"
    ></article-card>
  </b-page>
</template>

<script lang="ts">
import { defineComponent, useMeta, useRoute } from '@nuxtjs/composition-api'
import { useContent } from '~/composables/content'

export default defineComponent({
  head: {},
  nuxtI18n: {
    locales: ['en'],
  },
  middleware: ['cached'],
  setup() {
    const route = useRoute()
    const { post } = useContent('/content/guides/' + route.value.params.post)

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
