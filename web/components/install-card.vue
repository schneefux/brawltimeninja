<template>
  <b-card
    :class="['relative', {
      'hidden': !isInstallable || installBannerDismissed,
    }]"
    :title="$t('banner.install.title')"
  >
    <div slot="content">
      <button
        class="absolute top-0 right-0 mr-3 mt-2"
        @click="dismissInstall"
      >
        <font-awesome-icon :icon="faTimes"></font-awesome-icon>
      </button>
      <p>
        {{ $t('banner.install.catchphrase') }}
      </p>
    </div>

    <b-button
      slot="actions"
      class="mx-auto"
      md
      primary
      @click="clickInstall"
    >
      <font-awesome-icon
        :icon="faDownload"
        class="mr-1"
      ></font-awesome-icon>
      {{ $t('action.install') }}
    </b-button>
  </b-card>
</template>

<script lang="ts">
import { faDownload, faTimes } from '@fortawesome/free-solid-svg-icons'
import { computed, defineComponent, useStore } from '@nuxtjs/composition-api'
import { useGtag } from '~/composables/gtag'

export default defineComponent({
  setup() {
    const store = useStore<any>()

    const installBannerDismissed = computed(() => store.state.installBannerDismissed)
    const isInstallable = computed(() => store.getters['isInstallable'])

    const gtag = useGtag()
    const dismissInstall = () => {
      gtag.event('dismiss', {
        'event_category': 'app',
        'event_label': 'install_banner',
      })
      store.commit('dismissInstallBanner')
      store.commit('clearInstallPrompt')
    }
    const clickInstall = async () => {
      gtag.event('click', {
        'event_category': 'app',
        'event_label': 'install_banner',
      })
      await store.dispatch('install')
    }

    return {
      faTimes,
      faDownload,
      isInstallable,
      installBannerDismissed,
      dismissInstall,
      clickInstall,
    }
  },
})
</script>
