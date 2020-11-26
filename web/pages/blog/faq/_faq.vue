<template>
  <div class="page container">
    <article
      class="bg-grey-lighter py-8 px-6 my-8 text-black"
      itemscop
      itemtype="http://schema.org/AnalysisNewsArticle"
    >
      <h1 class="page-h1">
        <span class="text-primary-dark" itemprop="headline">{{ faq.title }}</span>
      </h1>
      <div class="mt-2">
        <nuxt-content
          :document="faq"
          ref="content"
          itemprop="articleBody"
        />
      </div>
    </article>
  </div>
</template>

<script lang="ts">
import { IContentDocument } from '@nuxt/content/types/content'
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      faq: undefined as undefined|IContentDocument,
    }
  },
  async asyncData({ params, $content, error }: any) {
    const faq = await $content(`faq/${params.faq}`).fetch()

    if (faq == undefined) {
      return error({ statusCode: 404, message: 'FaQ entry not found' })
    }

    return {
      faq,
    }
  },
})
</script>

<style scoped lang="postcss">
.nuxt-content {
  @apply leading-normal;
}

.nuxt-content /deep/ h2 {
  @apply text-3xl mt-3 mb-2;
}

.nuxt-content /deep/ h3 {
  @apply text-2xl mt-2 mb-1;
}

.nuxt-content /deep/ p {
  @apply mt-3;
}

.nuxt-content /deep/ ul {
  @apply list-disc list-inside;
}

.nuxt-content /deep/ li {
  @apply mt-2;
}

.nuxt-content /deep/ a {
  @apply underline text-primary-dark;
}
</style>
