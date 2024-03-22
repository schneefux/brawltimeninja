<template>
  <div class="h-full flex flex-col items-center justify-between gap-y-2 relative">
    <media-audio
      :path="path.replace(/\.ogg/, '')"
      class="leading-none"
    ></media-audio>
    <q
      v-if="voiceline.description != undefined"
      class="text-center"
      :class="{
        'italic [quotes:none]': !voiceline.description.startsWith('&quot;'),
      }"
    >{{ voiceline.description.replace(/&quot;/g, '') }}</q>
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
    voiceline: {
      type: Object as PropType<ScrapedBrawler['voicelines'][0]>,
      required: true
    },
  },
  setup(props) {
    const path = computed(() => props.voiceline.path)
    const $config = useConfig()
    const { download } = useDownload(computed(() => $config.mediaUrl + path.value))

    return {
      path,
      download,
      faDownload,
    }
  },
})
</script>
