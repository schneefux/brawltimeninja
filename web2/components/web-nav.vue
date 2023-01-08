<template>
  <b-web-nav
    :links="links"
    tag="nuxt-link"
  >
    <template slot="logo">
      <nuxt-link
        :to="localePath('/')"
        class="font-semibold text-xl tracking-tight leading-tight"
      >Brawl Time Ninja</nuxt-link>

      <navigator
        class="relative dark pl-8 mr-auto"
        input-class="light"
      ></navigator>
    </template>

    <template slot="before">
      <install-button></install-button>
    </template>

    <template slot="after">
      <locale-switcher
        class="border-0 align-text-top !text-2xs pr-7"
      ></locale-switcher>
    </template>
  </b-web-nav>
</template>

<script lang="ts">
import { computed, defineComponent, useContext } from 'vue'
import { BWebNav } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BWebNav,
  },
  setup() {
    const { localePath, i18n } = useContext()

    const links = computed(() => [ {
      name: i18n.t('nav.Profile Search'),
      target: localePath('/'),
    }, {
      name: i18n.t('nav.Brawler Tier List'),
      target: localePath('/tier-list/brawler'),
    }, {
      name: i18n.t('nav.Map Tier Lists'),
      target: localePath('/tier-list/map'),
    } ])

    return {
      links,
    }
  },
})
</script>
