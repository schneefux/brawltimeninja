<template>
  <div
    ref="container"
    class="flex flex-col justify-between min-h-screen bg-background text-text"
  >
    <web-nav class="hidden lg:flex"></web-nav>
    <app-head-nav class="lg:hidden"></app-head-nav>

    <loading-indicator></loading-indicator>

    <ad
      :ad-region="route.fullPath"
      ad-slot="6848221017"
      class="fixed left-4 inset-y-0 flex flex-col justify-center"
      scraper
    ></ad>
    <ad
      :ad-region="route.fullPath"
      ad-slot="8127026559"
      class="fixed right-4 inset-y-0 flex flex-col justify-center"
      scraper
    ></ad>

    <slot></slot>

    <client-only>
      <b-cookie-consent
        v-if="consentPopupVisible"
        @enable-none="disableCookies"
        @enable-cookies="enableCookies"
        @enable-all="enableCookiesAndAds"
      >
        <template v-slot:link>
          <router-link
            :to="localePath('/about')"
            class="underline"
          >link</router-link>
        </template>
      </b-cookie-consent>
    </client-only>

    <app-bottom-nav class="lg:hidden"></app-bottom-nav>
    <b-web-footer
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
import { BWebFooter, BCookieConsent } from '@schneefux/klicker/components'
import { useInstallPromptListeners } from '~/composables/app'
import { useI18n } from 'vue-i18n'
import { useConfig, useLocaleCookieRedirect, useLocalePath } from '@/composables/compat'
import { useRoute } from 'vue-router'
import { usePreferencesStore } from '@/stores/preferences'
import { usePlaywireRamp } from '@/composables/playwire-ramp'
import { useAdsense } from '@/composables/adsense'

export default defineComponent({
  components: {
    BWebFooter,
    BCookieConsent,
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

    const store = usePreferencesStore()
    const consentPopupVisible = computed(() => store.consentPopupVisible)

    const disableCookies = () => {
      store.cookiesAllowed = false
      store.adsAllowed = false
    }
    const enableCookies = () => {
      store.cookiesAllowed = true
      store.adsAllowed = false
    }
    const enableCookiesAndAds = () => {
      store.cookiesAllowed = true
      store.adsAllowed = true
    }

    const route = useRoute()

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
    if (config.playwireRampPublisherId == undefined) {
      useAdsense(config.adsensePubid)
    } else {
      usePlaywireRamp(config.playwireRampPublisherId, config.playwireRampSiteId)
    }

    return {
      route,
      links,
      disableCookies,
      enableCookies,
      enableCookiesAndAds,
      consentPopupVisible,
      container,
    }
  },
})
</script>
