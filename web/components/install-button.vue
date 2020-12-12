<template>
  <b-button
    v-show="isInstallable"
    class="md:mr-2"
    primary
    xs
    outline
    @click="clickInstall"
  >
    <font-awesome-icon
      class="mr-1"
      :icon="faDownload"
    ></font-awesome-icon>
    Install
  </b-button>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { faDownload } from '@fortawesome/free-solid-svg-icons'

export default Vue.extend({
  methods: {
    async clickInstall() {
      this.$gtag.event('click', {
        'event_category': 'app',
        'event_label': 'install_header',
      })
      await this.install()
    },
    ...mapActions({
      install: 'install',
    })
  },
  computed: {
    faDownload() {
      return faDownload
    },
    ...mapGetters({
      isInstallable: 'isInstallable',
    }),
  },
})
</script>
