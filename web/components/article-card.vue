<template>
  <card
    :title="title"
    :subtitle="author != undefined ? 'written by ' + author : ''"
    tag="article"
    itemscope
    itemtype="http://schema.org/AnalysisNewsArticle"
    light
    xxl
  >
    <div
      v-if="image"
      slot="infobar"
      :style="`background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${image}')`"
      class="h-48 bg-cover bg-center"
      itemprop="thumbnailUrl"
    ></div>
    <div slot="content">
      <nuxt-content
        :document="document"
        ref="content"
        itemprop="articleBody"
        class="prose prose-sm sm:prose lg:prose-lg"
      ></nuxt-content>

      <div
        v-show="lightboxOpen"
        class="fixed inset-0 z-50 bg-gray-900 bg-opacity-75"
      >
        <button
          class="absolute top-0 right-0 mr-10 mt-4 text-white text-5xl"
          @click="lightboxOpen = false"
        >
          &times;
        </button>
        <div
          class="h-full flex justify-center items-center"
          @click.self="lightboxOpen = false"
        >
          <img
            class="max-h-full max-w-full"
            :src="lightboxImage"
          >
        </div>
      </div>
    </div>
  </card>
</template>

<script lang="ts">
import { IContentDocument } from '@nuxt/content/types/content'
import Vue, { PropType } from 'vue'

export default Vue.extend({
  props: {
    title: {
      type: String,
      required: true
    },
    document: {
      type: Object as PropType<IContentDocument>,
      required: true
    },
    image: {
      type: String
    },
    author: {
      type: String
    },
  },
  data() {
    return {
      lightboxOpen: false,
      lightboxImage: '',
    }
  },
  mounted() {
    const contentElement = this.$refs.content as HTMLElement
    if (contentElement != undefined) {
      contentElement.querySelectorAll('img.lightbox').forEach((img) => {
        img.addEventListener('click', () => {
          this.lightboxImage = (<HTMLImageElement> img).src
          this.lightboxOpen = true
        })
      })
    }
  },
})
</script>
