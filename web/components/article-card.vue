<template>
  <b-card
    :title="document.title"
    tag="article"
    itemtype="http://schema.org/AnalysisNewsArticle"
    class="w-full max-w-2xl"
    itemscope
    no-filter
  >
    <template v-slot:infobar>
      <div
        v-if="document.image"
        :style="`background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${document.image}')`"
        class="h-48 bg-cover bg-center"
        itemprop="thumbnailUrl"
      ></div>
    </template>
    <template v-if="document.createdAt" v-slot:preview>
      <absolute-time :timestamp="document.createdAt" format-str="PP"></absolute-time>
    </template>
    <template v-slot:content>
      <div
        v-html="document.body"
        ref="content"
        itemprop="articleBody"
        class="prose dark:prose-invert"
      ></div>

      <b-lightbox v-model="lightboxOpen">
        <img
          class="max-h-full max-w-full"
          :src="lightboxImage"
        >
      </b-lightbox>
    </template>
    <template
      v-if="document.author != undefined"
      v-slot:actions
    >
      <p class="prose dark:prose-invert">
        This guide was written by {{ document.author }}<template v-if="document.attribution != undefined">
          <a
            v-if="document.attributionLink != undefined"
            :href="document.attributionLink"
            rel="nofollow"
            class="underline"
          >
            ({{ document.attribution }})
          </a>
          <span v-else>
            ({{ document.attribution }})
          </span>
        </template>.
      </p>
    </template>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, useTemplateRef } from 'vue'

export default defineComponent({
  props: {
    document: {
      type: Object,
      required: true
    },
  },
  setup() {
    const contentRef = useTemplateRef<HTMLElement>('content')
    const lightboxOpen = ref(false)
    const lightboxImage = ref('')

    onMounted(() => {
      if (contentRef.value != undefined) {
        contentRef.value.querySelectorAll('img.lightbox').forEach((img) => {
          img.addEventListener('click', () => {
            lightboxImage.value = (<HTMLImageElement> img).src
            lightboxOpen.value = true
          })
        })
      }
    })

    return {
      lightboxOpen,
      lightboxImage,
    }
  },
})
</script>
