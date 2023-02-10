<template>
  <b-card
    :class="['relative', {
      'hidden': !installable || installDismissed,
    }]"
    :title="$t('banner.install.title')"
  >
    <template v-slot:content><div >
      <button
        class="absolute top-0 right-0 mr-3 mt-2"
        @click="dismissInstall"
      >
        <fa
          :icon="faTimes"
          class="inline"
        ></fa>
      </button>
      <p>
        {{ $t('banner.install.catchphrase') }}
      </p>
    </div></template>

    <template v-slot:actions>
      <b-button
        class="mx-auto"
        md
        primary
        @click="clickInstall"
      >
        <fa
          :icon="faDownload"
          class="mr-1 inline"
        ></fa>
        {{ $t('action.install') }}
      </b-button>
    </template>
  </b-card>
</template>

<script lang="ts">
import { faDownload, faTimes } from '@fortawesome/free-solid-svg-icons'
import { defineComponent } from 'vue'
import { useInstall } from '~/composables/app'
import Fa from 'vue-fa'
import { BCard, BButton } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    Fa,
    BButton,
    BCard,
  },
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
