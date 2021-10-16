<template>
  <b-card
    :title="document.title"
    tag="article"
    itemscope
    itemtype="http://schema.org/AnalysisNewsArticle"
    light
    xxl
  >
    <div
      v-if="document.image"
      slot="infobar"
      :style="`background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${image}')`"
      class="h-48 bg-cover bg-center"
      itemprop="thumbnailUrl"
    ></div>
    <span
      slot="preview"
      class="text-gray-400 text-sm"
    >
      {{ date }}
    </span>
    <div slot="content">
      <nuxt-content
        :document="document"
        ref="content"
        itemprop="articleBody"
        class="prose prose-sm sm:prose lg:prose-lg"
      ></nuxt-content>

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
    >
      This guide was written by {{ document.author }}<template v-if="document.attribution != undefined">
        <b-wrapped-component
          :wrap="document.attributionLink != undefined"
        >
          <a
            slot="wrapper"
            :href="document.attributionLink"
            rel="nofollow"
            class="underline"
          ></a>
          <span>({{ document.attribution }})</span>
        </b-wrapped-component>
      </template>.
    </p>
  </b-card>
</template>

<script lang="ts">
import { IContentDocument } from '@nuxt/content/types/content'
import { format, parseISO } from 'date-fns'
import Vue, { PropType } from 'vue'
import { BWrappedComponent } from '~/klicker/components'

export default Vue.extend({
  components: {
    BWrappedComponent,
  },
  props: {
    document: {
      type: Object as PropType<IContentDocument>,
      required: true
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
  computed: {
    date(): string {
      return format(parseISO(this.document.createdAt as unknown as string), 'PP')
    },
  },
})
</script>
