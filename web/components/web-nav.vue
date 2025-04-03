<template>
  <b-web-nav
    tag="router-link"
    :screens="screens"
    :active-route="route.path"
    :ignore-route-prefix="localePath('/')"
  >
    <template v-slot:logo>
      <router-link
        :to="localePath('/')"
        class="font-semibold text-xl tracking-tight leading-tight"
      >
        <img
          :src="crownUrl"
          alt="Logo"
          class="inline h-6 w-6 object-contain mr-1"
        >
        Brawl Time Ninja
      </router-link>
    </template>

    <template v-slot:after>
      <navigator
        class="relative dark"
        input-class="light"
      ></navigator>
    </template>

    <template v-slot:end>
      <install-button></install-button>

      <locale-switcher
        class="border-0 align-text-top text-2xs! pr-7!"
      ></locale-switcher>
    </template>
  </b-web-nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { BWebNav } from '@schneefux/klicker/components'
import crownUrl from '~/assets/images/logo_with_crown_min.svg'
import { useScreens } from '~/composables/screens'
import { useRoute } from 'vue-router';

export default defineComponent({
  components: {
    BWebNav,
  },
  setup() {
    const screens = useScreens()
    const route = useRoute()

    return {
      route,
      screens,
      crownUrl,
    }
  },
})
</script>
