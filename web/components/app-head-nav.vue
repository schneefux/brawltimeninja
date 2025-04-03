<template>
  <b-app-head-nav>
    <router-link :to="localePath('/')">
      <img
        :src="crownUrl"
        alt="Logo"
        class="h-6 w-6 object-contain"
      >
    </router-link>

    <navigator
      class="mr-auto dark"
      input-class="light"
    ></navigator>

    <install-button
      class="h-6"
    ></install-button>

    <b-button
      :to="localePath('/about')"
      :label="$t('nav.About')"
      class="w-6 text-center h-6"
      primary
    >
      <fa :icon="faInfo"></fa>
    </b-button>

    <locale-switcher
      class="h-6 text-2xs! pr-7!"
    ></locale-switcher>
  </b-app-head-nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { faInfo } from '@fortawesome/free-solid-svg-icons'
import { BAppHeadNav, Fa } from '@schneefux/klicker/components'
import crownUrl from '~/assets/images/logo_with_crown_min.svg'

export default defineComponent({
  components: {
    BAppHeadNav,
    Fa,
  },
  setup() {
    return {
      faInfo,
      crownUrl,
    }
  },
})
</script>
