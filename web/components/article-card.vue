<template>
  <b-card
    :title="document.title"
    tag="article"
    itemtype="http://schema.org/AnalysisNewsArticle"
    class="w-full max-w-2xl"
    itemscope
    no-filter
  >
    <div
      v-if="document.image"
      slot="infobar"
      :style="`background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${document.image}')`"
      class="h-48 bg-cover bg-center"
      itemprop="thumbnailUrl"
    ></div>
    <span slot="preview">{{ date }}</span>
    <div slot="content">
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
    </div>
    <p
      slot="actions"
      v-if="document.author != undefined"
      class="prose dark:prose-invert"
    >
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
  </b-card>
</template>

<script lang="ts">
import { format, parseISO } from 'date-fns'
import { computed, defineComponent, onMounted, ref } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    document: {
      type: Object,
      required: true
    },
  },
  setup(props) {
    const content = ref<HTMLElement>()
    const lightboxOpen = ref(false)
    const lightboxImage = ref('')

    const date = computed(() => format(parseISO(props.document.createdAt), 'PP'))

    onMounted(() => {
      if (content.value != undefined) {
        content.value.querySelectorAll('img.lightbox').forEach((img) => {
          img.addEventListener('click', () => {
            lightboxImage.value = (<HTMLImageElement> img).src
            lightboxOpen.value = true
          })
        })
      }
    })

    return {
      content,
      date,
      lightboxOpen,
      lightboxImage,
    }
  },
})
</script>
