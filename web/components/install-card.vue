<template>
  <card
    v-if="isInstallable && !installBannerDismissed"
    title="Install the web app"
    primary
    md
    class="relative"
  >
    <div
      slot="content"
    >
      <button
        class="absolute top-0 right-0 mr-3 mt-2"
        @click="dismissInstall"
      >
        <font-awesome-icon :icon="faTimes"></font-awesome-icon>
      </button>
      <p>
        Track your trophies easily. Light, fast and free.
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
      Install
    </b-button>
  </card>
</template>

<script lang="ts">
import { faDownload, faTimes } from '@fortawesome/free-solid-svg-icons'
import Vue from 'vue'
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

export default Vue.extend({
  computed: {
    faTimes() {
      return faTimes
    },
    faDownload() {
      return faDownload
    },
    ...mapState({
      installBannerDismissed: (state: any) => state.installBannerDismissed as boolean,
    }),
    ...mapGetters({
      isInstallable: 'isInstallable',
    }),
  },
  methods: {
    dismissInstall() {
      this.$gtag.event('dismiss', {
        'event_category': 'app',
        'event_label': 'install_banner',
      })
      this.clearInstallPrompt()
      this.dismissInstallBanner()
    },
    async clickInstall() {
      this.$gtag.event('click', {
        'event_category': 'app',
        'event_label': 'install_banner',
      })
      await this.install()
    },
    ...mapMutations({
      dismissInstallBanner: 'dismissInstallBanner',
      clearInstallPrompt: 'clearInstallPrompt',
    }),
    ...mapActions({
      install: 'install',
    })
  }
})
</script>
