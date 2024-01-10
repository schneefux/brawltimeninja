<template>
  <b-button
    v-bind="$attrs"
    class="leading-none"
    @click="play()"
  >
    <fa
      :icon="faPlayCircle"
      class="text-3xl"
    ></fa>
  </b-button>
  <audio ref="audioEl">
    <source
      :src="mediaUrl + path + '.ogg'"
      type="audio/ogg"
    >
    <source
      :src="mediaUrl + path + '.mp3'"
      type="audio/mpeg"
    >
  </audio>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useConfig } from "~/composables/compat";
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons'
import { BButton, Fa } from '@schneefux/klicker/components'

export default defineComponent({
  inheritAttrs: false,
  components: {
    BButton,
    Fa,
  },
  props: {
    path: {
      type: String,
      required: true
    },
  },
  setup() {
    const $config = useConfig()
    const mediaUrl = computed(() => $config.mediaUrl)
    const audioEl = ref<HTMLAudioElement>()

    const play = () => audioEl.value?.play()

    return {
      play,
      mediaUrl,
      audioEl,
      faPlayCircle,
    }
  },
})
</script>
