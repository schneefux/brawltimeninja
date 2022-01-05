<template>
  <v-card-wrapper
    v-bind="$props"
    :card="card && { ...card, title }"
    component="v-markdown"
  >
    <div
      slot="content"
      class="prose prose-invert text-gray-200"
      v-html="html"
    ></div>
  </v-card-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'
import { OptionalVisualisationProps } from '~/klicker'
import { VCardWrapper } from '~/klicker/components'
import '@kangc/v-md-editor/lib/style/preview-html.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import createEmojiPlugin from '@kangc/v-md-editor/lib/plugins/emoji/index'
import VueMarkdownEditor, { xss } from '@kangc/v-md-editor'

VueMarkdownEditor.use(githubTheme)
VueMarkdownEditor.use(createEmojiPlugin())

export default defineComponent({
  components: {
    VCardWrapper,
  },
  props: {
    ...OptionalVisualisationProps,
    title: {
      type: String,
      required: false
    },
    markdown: {
      type: String,
      required: true
    },
  },
  setup(props) {
    const html = computed(() => xss.process(VueMarkdownEditor.themeConfig.markdownParser.render(props.markdown)))

    return {
      html,
    }
  },
})
</script>
