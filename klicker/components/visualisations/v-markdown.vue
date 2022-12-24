<template>
  <v-card-wrapper
    v-bind="$props"
    :card="card && { ...card, title }"
    component="v-markdown"
  >
    <template v-slot:content>
      <div
        class="prose prose-invert"
        v-html="html"
      ></div>
    </template>
  </v-card-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import VCardWrapper from './v-card-wrapper.vue'
import { StaticProps } from '../../props'
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
    ...StaticProps,
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
