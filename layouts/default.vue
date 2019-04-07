<template>
  <div
    class="flex flex-col justify-between min-h-screen bg-primary-darkest text-grey-lighter bg-center"
    :style="`background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${background}'`">
    <nav class="bg-primary-dark p-6">
      <nuxt-link to="/" class="no-underline font-semibold text-xl text-white tracking-tight">
        {{ labels.appTitle }} Time Ninja
      </nuxt-link>
    </nav>

    <nuxt />

    <footer class="bg-primary-darker py-2 text-sm text-center leading-normal">
      <p>&#169; 2019 Online Time Ninja Project</p>
      <p class="text-xs leading-tight">{{ labels.disclaimer }}</p>
      <p class="text-xs leading-tight">Send questions or feedback to dev (at) {{ domain }}.</p>
    </footer>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    background() {
      if (global.screen !== undefined && screen.width > 720) {
        return this.labels.backgroundDesktop
      } else {
        return this.labels.backgroundMobile
      }
    },
    domain() {
      if (global.window !== undefined) {
        return window.location.hostname
      }

      return ''
    },
    ...mapState({
      labels: state => state.labels,
    }),
  },
}
</script>
