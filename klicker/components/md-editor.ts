import '@kangc/v-md-editor/lib/style/preview-html.css'
import '@kangc/v-md-editor/lib/style/base-editor.css'

import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'

import createEmojiPlugin from '@kangc/v-md-editor/lib/plugins/emoji/index'
import '@kangc/v-md-editor/lib/plugins/emoji/emoji.css'

import enUS from '@kangc/v-md-editor/lib/lang/en-US'

import VMdEditor, { xss } from '@kangc/v-md-editor'

VMdEditor.lang.use('en-US', enUS)
VMdEditor.use(githubTheme)
VMdEditor.use(createEmojiPlugin())

export { xss }
export default VMdEditor
