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
import { defineComponent, useMeta, useRoute } from '@nuxtjs/composition-api'
import { useContent } from '~/composables/content'

export default defineComponent({
  head: {},
  middleware: ['cached'],
  nuxtI18n: {
    locales: ['en'],
  },
  setup() {
    const route = useRoute()
    const { post } = useContent('faq/' + route.value.params.faq)

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
