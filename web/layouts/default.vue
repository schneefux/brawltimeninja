<template>
  <div
    ref="container"
    class="min-h-screen bg-background text-text"
  >
    <web-nav id="web-nav" class="hidden lg:flex"></web-nav>
    <app-head-nav id="app-nav" class="lg:hidden"></app-head-nav>

    <loading-indicator></loading-indicator>

    <ad
      ad-slot="6848221017"
      class="fixed left-4 top-1/2 -translate-y-1/2 text-left"
      scraper
    ></ad>
    <ad
      ad-slot="8127026559"
      class="fixed right-4 top-1/2 -translate-y-1/2 text-right"
      scraper
    ></ad>

    <div id="main" class="fill-layout-height">
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
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useMutationObserver } from '@vueuse/core'
import { BWebFooter } from '@schneefux/klicker/components'
import { useInstallPromptListeners } from '~/composables/app'
import { useI18n } from 'vue-i18n'
import { useConfig, useLocaleCookieRedirect, useLocalePath } from '~/composables/compat'
import { useRoute } from 'vue-router'
import { usePlaywireRamp } from '~/composables/playwire-ramp'
import { useQuantcast } from '~/composables/quantcast'
import { useAdsense } from '~/composables/adsense'

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

    useMutationObserver(container, () => {
      // workaround for AdSense overriding min-height: 0px
      // https://weblog.west-wind.com/posts/2020/May/25/Fixing-Adsense-Injecting-height-auto-important-into-scrolled-Containers
      // wtf Google
      container.value!.style.minHeight = ''
    }, {
      attributes: true,
      attributeFilter: ['style'],
    })

    useInstallPromptListeners()
    useLocaleCookieRedirect()

    const enablePlaywire = config.playwireRampPublisherId != ''
    if (enablePlaywire) {
      usePlaywireRamp(config.playwireRampPublisherId, config.playwireRampSiteId)
    } else {
      useAdsense(config.adsensePubid)
    }

    useQuantcast(config.quantcastChoiceId)

    return {
      links,
      container,
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
