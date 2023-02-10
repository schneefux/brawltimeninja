<template>
  <v-card-wrapper
    :loading="false"
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
import VMdEditor, { xss } from '../md-editor'

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
    const html = computed(() => xss.process(VMdEditor.vMdParser.themeConfig.markdownParser.render(props.markdown)))

    return {
      html,
    }
  },
})
</script>
