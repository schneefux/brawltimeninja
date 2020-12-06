<template>
  <button
    v-show="isInstallable"
    class="px-2 border rounded border-primary-lighter text-primary-lightest lg:p-0 lg:my-0 lg:mr-4 lg:border-0 lg:text-lg lg:font-medium"
    @click="clickInstall"
  >
    <font-awesome-icon
      class="mr-1"
      :icon="faDownload"
    ></font-awesome-icon>
    Install
  </button>
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
