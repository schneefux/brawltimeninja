<template>
  <b-button
    :class="{
      'hidden': !installable,
    }"
    class="!py-1 !px-2 -my-1 !text-xs md:text-sm whitespace-nowrap"
    secondary
    sm
    @click="clickInstall"
  >
    <font-awesome-icon
      class="mr-1"
      :icon="faDownload"
    ></font-awesome-icon>
    {{ $t('action.install') }}
  </b-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { useInstall } from '~/composables/app'

export default defineComponent({
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
