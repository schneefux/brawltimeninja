<template>
  <b-button
    v-bind="$attrs"
    :href="renderUrl"
    target="_blank"
    tag="a"
    @click.once="share($event)"
  >{{ buttonText || $t('action.share') }}</b-button>
</template>

<script lang="ts">
import { useConfig } from '@/composables/compat'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  inheritAttrs: false,
  props: {
    embedUrl: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      default: 'share.png'
    },
    title: {
      type: String,
      required: false
    },
    text: {
      type: String,
      required: false
    },
    url: {
      type: String,
      required: false
    },
    buttonText: {
      type: String,
      required: false
    },
  },
  setup(props, { emit }) {
    const $config = useConfig()

    const renderUrl = computed(() => {
      const url = new URL($config.renderUrl + props.embedUrl)
      url.searchParams.append('download', '')
      return url.toString()
    })

    const share = async (event: Event) => {
      event.preventDefault()

      // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
      const response = await fetch(renderUrl.value)
      const blob = await response.blob()
      const files = [new File([blob], props.filename, { type: blob.type })]

      let shared = false
      if ((<any>navigator).canShare && (<any>navigator).canShare({ files })) {
        try {
          await navigator.share({
            files,
            title: props.title,
            text: props.text,
            url: props.url,
          } as any)
          shared = true
        } catch (err) {
          console.error(err)
        }
      }

      if (!shared) {
        const button = event.target as HTMLAnchorElement
        button.click()
        shared = true
      }

      if (shared) {
        emit('share')
      }
    }

    return {
      share,
      renderUrl,
    }
  },
})
</script>
