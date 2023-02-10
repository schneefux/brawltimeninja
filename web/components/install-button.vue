<template>
  <b-button
    v-show="installable"
    class="!py-1 !px-2 -my-1 !text-xs md:text-sm whitespace-nowrap"
    secondary
    sm
    @click="clickInstall"
  >
    <fa
      :icon="faDownload"
      class="mr-1"
    ></fa>
    {{ $t('action.install') }}
  </b-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { useInstall } from '~/composables/app'
import { BButton, Fa } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    Fa,
    BButton,
  },
  setup() {
    const { installable, clickInstall } = useInstall('header')

    return {
      installable,
      clickInstall,
      faDownload,
    }
  },
})
</script>
