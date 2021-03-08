<template>
  <page class="flex justify-center">
    <article-card
      :title="faq.title"
      :document="faq"
      author="schneefux"
    ></article-card>
  </page>
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
  meta: {
    title: 'FAQ',
    screen: 'guides',
  },
  middleware: ['cached'],
  nuxtI18n: {
    locales: ['en'],
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
