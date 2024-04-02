<template>
  <div
    ref="container"
    class="min-h-screen bg-background text-text"
  >
    <web-nav id="web-nav" class="hidden lg:flex"></web-nav>
    <app-head-nav id="app-nav" class="lg:hidden"></app-head-nav>

    <loading-indicator></loading-indicator>

    <div id="main" class="fill-layout-height">
      <!-- request by Venatus: ads should be refreshed on page navigation -->
      <ad
        v-if="topBannerType == 'takeover'"
        :key="`takeover-${$route.path}`"
        takeover
        first
      ></ad>
      <ad
        v-else-if="topBannerType == 'banner'"
        :key="`banner-${$route.path}`"
        banner
        first
      ></ad>

      <slot></slot>
    </div>

    <app-bottom-nav id="app-bottom-nav" class="lg:hidden"></app-bottom-nav>
    <b-web-footer
      id="footer"
      :links="links"
      tag="router-link"
      class="hidden lg:block"
    >
      <template v-slot:below>
        <copyright
          class="mt-4 text-sm"
        ></copyright>
      </template>
    </b-web-footer>

    <adblock-bait></adblock-bait>
    <venatus-rich-media
      :key="`rich-media-${$route.path}`"
    ></venatus-rich-media>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { BWebFooter } from '@schneefux/klicker/components'
import { useInstallPromptListeners } from '~/composables/app'
import { useI18n } from 'vue-i18n'
import { useConfig, useLocaleCookieRedirect, useLocalePath } from '~/composables/compat'
import { useQuantcast } from '~/composables/quantcast'
import { useVenatus } from '~/composables/venatus'
import { useRoute } from 'vue-router'

export default defineComponent({
  components: {
    BWebFooter,
  },
  setup() {
    const container = ref<HTMLElement>()

    const config = useConfig()
    const i18n = useI18n()
    const localePath = useLocalePath()

    const links = computed(() => [ {
      name: i18n.t('nav.Leaderboards'),
      target: localePath('/leaderboard/hours'),
    }, {
      name: i18n.t('nav.Guides'),
      target: localePath('/blog/guides'),
    }, {
      name: i18n.t('nav.Status'),
      target: localePath('/status'),
    }, {
      name: i18n.t('nav.Privacy'),
      target: localePath('/about'),
    }])

    useInstallPromptListeners()
    useLocaleCookieRedirect()

    const enableVenatus = config.venatusSiteId != ''
    if (enableVenatus) {
      useVenatus(config.venatusSiteId)
    }

    useQuantcast(config.quantcastChoiceId)

    const route = useRoute()
    const topBannerType = computed(() => route.meta.topBannerType as string ?? 'takeover')

    return {
      links,
      container,
      topBannerType,
    }
  },
})
</script>

<style lang="postcss">
/* do not use scoped to suppress Vue warning about non-prop attributes */

/* main content size = 100vh - header - footer */

.fill-layout-height {
  min-height: calc(100vh - 56px - 56px);
}

@media screen(lg) {
  .fill-layout-height {
    min-height: calc(100vh - 76px - 160px);
  }
}
</style>
