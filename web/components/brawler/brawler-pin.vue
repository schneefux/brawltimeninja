<template>
  <div class="h-full flex flex-col items-center justify-center relative">
    <media-img
      :path="path.replace(/\.(png|gif)/, '')"
      :alt="name"
      :animated="path.endsWith('.gif')"
      clazz="max-h-20"
      size="160"
      loading="lazy"
    ></media-img>
    <b-button
      class="absolute bottom-1 right-1 -mr-3"
      light
      xs
      @click="download()"
    >
      <fa :icon="faDownload"></fa>
    </b-button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { Fa } from '@schneefux/klicker/components'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { ScrapedBrawler } from '~/model/Web'
import { useDownload } from '~/composables/download'
import { useConfig } from '~/composables/compat'

export default defineComponent({
  components: {
    Fa,
  },
  props: {
    pin: {
      type: Object as PropType<ScrapedBrawler['pins'][0]>,
      required: true
    },
  },
  setup(props) {
    const path = computed(() => props.pin.path)
    const name = computed(() => props.pin.name)
    const $config = useConfig()
    const { download } = useDownload(computed(() => $config.mediaUrl + path.value), name)

    return {
      path,
      name,
      download,
      faDownload,
    }
  },
})
</script>
