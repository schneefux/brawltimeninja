<template>
  <div class="page container flex justify-center">
    <article-card
      :title="faq.title"
      :document="faq"
      author="schneefux"
    ></article-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { IContentDocument } from '@nuxt/content/types/content'
import { MetaInfo } from 'vue-meta'

export default Vue.extend({
  head(): MetaInfo {
    if (this.faq == undefined) {
      return {}
    }
    const description = `${this.faq.question}`
    return {
      title: this.faq.title,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      faq: undefined as undefined|IContentDocument,
    }
  },
  async asyncData({ params, $content, error }: any) {
    const faq = await $content(`faq/${params.faq}`).fetch()

    if (faq == undefined) {
      return error({ statusCode: 404, message: 'FAQ entry not found' })
    }

    return {
      faq,
    }
  },
})
</script>
