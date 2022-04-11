<template>
  <b-button
    :class="{
      'hidden': !isInstallable,
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
import { computed, defineComponent, useStore } from '@nuxtjs/composition-api'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { useGtag } from '~/composables/gtag'

export default defineComponent({
  setup() {
    const gtag = useGtag()

    const store = useStore()
    const isInstallable = computed(() => store.getters['isInstallable'])

    const clickInstall = async() => {
      gtag.event('click', {
        'event_category': 'app',
        'event_label': 'install_header',
      })
      await store.dispatch('install')
    }

    return {
      isInstallable,
      clickInstall,
      faDownload,
    }
  },
})
</script>
