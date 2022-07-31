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
import { defineComponent } from '@nuxtjs/composition-api'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { useGtag } from '~/composables/gtag'
import { install, installable } from '~/composables/app'

export default defineComponent({
  setup() {
    const gtag = useGtag()

    const clickInstall = async() => {
      gtag.event('click', {
        'event_category': 'app',
        'event_label': 'install_header',
      })
      await install()
    }

    return {
      installable,
      clickInstall,
      faDownload,
    }
  },
})
</script>
