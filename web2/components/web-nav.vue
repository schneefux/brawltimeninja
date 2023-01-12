<template>
  <b-web-nav
    :links="links"
    tag="router-link"
  >
    <template v-slot:logo>
      <router-link
        :to="'/'"
        class="font-semibold text-xl tracking-tight leading-tight"
      >Brawl Time Ninja</router-link>

      <navigator
        class="relative dark pl-8 mr-auto"
        input-class="light"
      ></navigator>
    </template>

    <template v-slot:before>
      <install-button></install-button>
    </template>

    <template v-slot:after>
      <locale-switcher
        class="border-0 align-text-top !text-2xs pr-7"
      ></locale-switcher>
    </template>
  </b-web-nav>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { BWebNav } from '@schneefux/klicker/components'
import { useContext } from '@/composables/compat'

export default defineComponent({
  components: {
    BWebNav,
  },
  setup() {
    const { i18n } = useContext()

    const links = computed(() => [ {
      name: i18n.t('nav.Profile Search'),
      target: '/',
    }, {
      name: i18n.t('nav.Brawler Tier List'),
      target: '/tier-list/brawler',
    }, {
      name: i18n.t('nav.Map Tier Lists'),
      target: '/tier-list/map',
    } ])

    return {
      links,
    }
  },
})
</script>
