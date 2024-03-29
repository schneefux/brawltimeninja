<template>
  <b-button
    :href="renderUrl"
    target="_blank"
    tag="a"
    @click.once.prevent="share($event)"
  >{{ buttonText || $t('action.share') }}</b-button>
</template>

<script lang="ts">
import { useConfig } from '~/composables/compat'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  props: {
    embedUrl: {
      type: String,
      required: false
    },
    renderUrl: {
      type: String,
      required: false
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
  emits: {
    share: () => true,
    cancel: () => true,
  },
  setup(props, { emit }) {
    const $config = useConfig()

    const renderUrl = computed(() => {
      if (props.renderUrl) {
        return props.renderUrl
      }

      const url = new URL($config.renderUrl + props.embedUrl)
      url.searchParams.append('download', '')
      return url.toString()
    })

    const share = async (event: Event) => {
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
          if (err instanceof DOMException && err.name === 'AbortError') {
            emit('cancel')
            return
          }
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
