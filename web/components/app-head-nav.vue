<template>
  <b-app-head-nav>
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
  </b-app-head-nav>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { faInfo } from '@fortawesome/free-solid-svg-icons'
import { BAppHeadNav } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BAppHeadNav,
  },
  setup() {
    return {
      faInfo,
    }
  },
})
</script>
