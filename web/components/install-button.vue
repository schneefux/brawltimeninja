<template>
  <button
    v-show="isInstallable"
    :class="{
      'px-2 py-1 -my-1 border rounded border-primary-light text-primary-lightest': !mini,
      'lg:p-0 lg:my-0 lg:mr-4 lg:border-0 lg:text-lg lg:font-medium': !mini,
    }"
    @click="clickInstall"
  >
    <font-awesome-icon
      :class="!mini ? 'mr-1' : ''"
      :icon="faDownload"
    ></font-awesome-icon>
    <template v-if="!mini">Install</template>
  </button>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { faDownload } from '@fortawesome/free-solid-svg-icons'

export default Vue.extend({
  props: {
    mini: {
      type: Boolean
    },
  },
  methods: {
    async clickInstall() {
      this.$ga.event('app', 'click', 'install_header')
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
