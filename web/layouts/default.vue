<template>
  <div
    ref="container"
    class="min-h-screen"
  >
    <web-nav id="web-nav" class="hidden lg:flex"></web-nav>
    <app-head-nav id="app-nav" class="lg:hidden"></app-head-nav>

    <loading-indicator></loading-indicator>

    <div id="main" class="min-h-(--mobile-layout-height) lg:min-h-(--desktop-layout-height) bg-background text-text vm-main">
      <slot></slot>

      <copyright
        class="mx-4 mt-16 mb-8 text-sm lg:hidden"
      ></copyright>
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
import { computed, defineComponent } from 'vue'
import { BWebFooter } from '@schneefux/klicker/components'
import { useInstallPromptListeners } from '~/composables/app'
import { useI18n } from 'vue-i18n'
import { useConfig, useLocaleCookieRedirect, useLocalePath } from '~/composables/compat'
import { useQuantcast } from '~/composables/quantcast'
import { useVenatus } from '~/composables/venatus'
import { useInstallGtag } from '~/composables/gtag'

export default defineComponent({
  components: {
    BWebFooter,
  },
  setup() {
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
      useVenatus()
    }

    if (config.quantcastChoiceId) {
      useQuantcast(config.quantcastChoiceId)
    }

    const enableGtag = config.ga4Id != ''
    if (enableGtag) {
      useInstallGtag(config.ga4Id)
    }

    return {
      links,
    }
  },
})
</script>

<style>
/* do not use scoped to suppress Vue warning about non-prop attributes */

/* main content size = 100vh - header - footer */

:root {
  --mobile-layout-height: calc(100vh - 56px - 56px);
  --desktop-layout-height: calc(100vh - 76px - 160px);
}

/* styles for Venatus ads */

@reference "~/assets/css/tailwind.css";

/* leave space for sticky footer */
#main {
  @apply max-md:pb-[100px]!; /* sticky footer height */
}

/* push footer above bottom nav */
.vm-footer {
  @apply max-md:bottom-14!; /* 3.5rem (14) for footer */
}

/* push instream video player above bottom nav and sticky ad */
avp-player-ui {
  /* 3.5rem (14) for footer + 50px for mobile footer ad + 0.75rem padding */
  --avp-offset-bottom: 120px !important;

  --avp-offset-right: 8px !important;
}
</style>
