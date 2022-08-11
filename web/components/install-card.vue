<template>
  <b-card
    :class="['relative', {
      'hidden': !installable || installDismissed,
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
import { defineComponent } from '@nuxtjs/composition-api'
import { useInstall } from '~/composables/app'

export default defineComponent({
  setup() {
    const { installable, clickInstall, dismissInstall, installDismissed } = useInstall('banner')

    return {
      faTimes,
      faDownload,
      installable,
      installDismissed,
      dismissInstall,
      clickInstall,
    }
  },
})
</script>
