<template>
  <div class="light bg-yellow-400 text-gray-800 h-14 p-4 z-40 sticky top-0 flex items-center gap-x-2">
    <nuxt-link to="/">
      <img
        src="~/assets/images/logo_with_crown_min.svg"
        alt="Logo"
        class="h-6 w-6 object-contain"
      >
    </nuxt-link>

    <navigator
      class="mr-auto dark"
      input-class="light"
    ></navigator>

    <install-button
      class="h-6"
    ></install-button>

    <b-button
      to="/about"
      :label="$t('nav.About')"
      class="w-6 text-center h-6"
      primary
    >
      <font-awesome-icon
        :icon="faInfo"
      ></font-awesome-icon>
    </b-button>

    <locale-switcher
      class="h-6 !text-2xs pr-7"
    ></locale-switcher>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { faInfo } from '@fortawesome/free-solid-svg-icons'

export default defineComponent({
  setup() {
    return {
      faInfo,
    }
  },
})
</script>
