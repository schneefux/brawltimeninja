<template>
  <div class="md:w-120">
    <v-md-editor
      :value="value"
      left-toolbar="undo redo clear | h bold italic strikethrough | ul ol hr"
      right-toolbar=""
      mode="edit"
      @input="text => $emit('input', text)"
    ></v-md-editor>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi'
import VMdEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import createEmojiPlugin from '@kangc/v-md-editor/lib/plugins/emoji/index'
import enUS from '@kangc/v-md-editor/lib/lang/en-US'

VMdEditor.lang.use('en-US', enUS)
VMdEditor.use(githubTheme)
VMdEditor.use(createEmojiPlugin())

export default defineComponent({
  components: {
    VMdEditor,
  },
  props: {
    value: {
      type: String,
      required: true
    },
  },
})
</script>
