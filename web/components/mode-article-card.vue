<template>
  <card
    v-if="article != undefined"
    v-bind="$attrs"
    :title="modeName + ' Description'"
    :loading="$fetchState.pending"
    tag="article"
    itemscope
    itemtype="http://schema.org/AnalysisNewsArticle"
    light
  >
    <template v-slot:content>
      <p
        class="prose prose-sm sm:prose lg:prose-lg"
      >{{ article.modeDescription }}</p>

      <div
        v-show="expand"
        class="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 h-screen w-screen overflow-y-scroll"
        @click.self="expand = false"
      >
        <button
          class="fixed top-0 right-0 mr-10 mt-4 text-white rounded-full h-12 w-12 bg-gray-800 text-4xl pb-2 leading-none"
          @click="expand = false"
        >
          &times;
        </button>
        <card
          tag="article"
          class="mt-8 mb-24 mx-auto"
          itemscope
          itemtype="http://schema.org/AnalysisNewsArticle"
          xxl
          light
       >
        <template v-slot:content>
          <div class="mt-10 prose prose-sm sm:prose lg:prose-lg xl:prose-xl">
            <h1>
              {{ modeName }} Guide
            </h1>
          </div>

          <nuxt-content
            :document="article"
            itemprop="articleBody"
            class="mt-10 prose prose-sm sm:prose lg:prose-lg xl:prose-xl"
          ></nuxt-content>
        </template>
        <p
          slot="actions"
          v-if="article.author != undefined"
        >
          This guide was written by {{ article.author }}<template v-if="article.attribution != undefined">
            <wrapped-component
              :wrap="article.attributionLink != undefined"
            >
              <a
                slot="wrapper"
                :href="article.attributionLink"
                rel="nofollow"
                class="underline"
              ></a>
              <span>({{ article.attribution }})</span>
            </wrapped-component>
          </template>.
        </p>
        </card>
      </div>
    </template>

    <b-button
      slot="actions"
      md
      light
      @click="expand = !expand"
    >{{ !expand ? 'Open Guide' : 'Close Guide' }}</b-button>
  </card>
</template>

<script lang="ts">
import { IContentDocument } from '@nuxt/content/types/content'
import Vue from 'vue'
import { camelToKebab, formatMode, slugify } from '~/lib/util'

export default Vue.extend({
  props: {
    mode: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      article: undefined as IContentDocument|undefined,
      expand: false,
    }
  },
  fetchDelay: 0,
  async fetch() {
    // TODO fetch description from API / game files
    // TODO add a TOC
    this.article = await this.$content(`modes/${camelToKebab(this.mode).replace(/_/g, '-')}`)
      .fetch().catch(() => undefined) as IContentDocument|undefined
  },
  computed: {
    modeName(): string {
      return formatMode(this.mode)
    },
  },
})
</script>
