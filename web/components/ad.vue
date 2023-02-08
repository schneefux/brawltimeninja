<template>
  <div
    v-if="banner"
    class="mt-4"
  >
    <client-only v-if="allowed && !playwire">
      <div class="flex justify-center -mx-4">
        <adsense
          :data-ad-slot="adSlot"
          :data-ad-region="adRegion"
          data-ad-format=""
          data-ad-client="ca-pub-6856963757796636"
          class="banner-ad"
        ></adsense>
      </div>

      <template v-slot:placeholder>
        <div class="adswrapper ad-section banner-ad"></div>
      </template>
    </client-only>
  </div>
  <div v-else-if="scraper">
    <client-only v-if="allowed && scraperFits && !playwire">
      <adsense
        :data-ad-slot="adSlot"
        :data-ad-region="adRegion"
        data-ad-format=""
        data-ad-client="ca-pub-6856963757796636"
        class="scraper-ad"
      ></adsense>

      <template v-slot:placeholder>
        <div class="adswrapper ad-section scraper-ad"></div>
      </template>
    </client-only>
  </div>
  <b-page-section
    v-else
    ref="ad"
    class="flex justify-center"
  >
    <client-only v-if="allowed && visible">
      <playwire-ramp
        v-if="playwire"
        :ad-id="adSlot"
        :instance="instance"
        :type="`${leaderboardFits ? 'leaderboard' : 'med_rect'}_${first ? 'atf' : 'btf'}`"
        class="adsbygoogle section-ad"
      ></playwire-ramp>
      <adsense
        v-else
        :data-ad-slot="adSlot"
        :data-ad-region="adRegion"
        data-ad-format="auto"
        data-ad-client="ca-pub-6856963757796636"
      ></adsense>

      <template v-slot:placeholder>
        <div
          class="adswrapper ad-section w-full"
          style="height: 300px;"
        ></div>
      </template>
    </client-only>
  </b-page-section>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { useBreakpoints, useIntersectionObserver } from '@vueuse/core'
import { isApp } from '~/composables/app'
import { usePreferencesStore } from '@/stores/preferences'
import { useConfig } from '@/composables/compat'
import { useRoute } from 'vue-router'

export default defineComponent({
  props: {
    adSlot: {
      type: String,
      required: true
    },
    instance: {
      type: String
    },
    first: {
      type: Boolean,
      default: false
    },
    lazy: {
      type: Boolean,
      default: false
    },
    banner: {
      type: Boolean,
      default: false
    },
    scraper: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const store = usePreferencesStore()
    const ad = ref<HTMLElement>()
    const visible = ref(!props.lazy || props.first)

    // default to "allow" on SSR to render placeholders
    const userAllowed = computed(() => store.adsAllowed == undefined || store.adsAllowed == true)
    const policyAllowed = computed(() => props.first || isApp.value == undefined || isApp.value == false)
    const allowed = computed(() => policyAllowed.value && userAllowed.value)

    if (!import.meta.env.SSR) {
      const { isSupported, stop } = useIntersectionObserver(ad, ([{ isIntersecting }]) => {
        if (isIntersecting && allowed.value) {
          visible.value = true
          stop()
        }
      }, {
        rootMargin: `50% 50% 50% 50%`,
      })

      if (!isSupported) {
        visible.value = true
      }
    }

    const config = useConfig()
    const playwire = config.playwireRampPublisherId != ''

    const breakpoints = useBreakpoints({
      leaderboard: 728,
      scraper: 1900,
    })
    const leaderboardFits = breakpoints.greaterOrEqual('leaderboard')
    const scraperFits = breakpoints.greaterOrEqual('scraper')

    const route = useRoute()
    const adRegion = computed(() => route.fullPath)

    return {
      ad,
      adRegion,
      visible,
      allowed,
      playwire,
      scraperFits,
      leaderboardFits,
    }
  },
})
</script>

<style lang="postcss">
/*
 * Playwire mobile leaderboard:
 *  - 320x50
 *  - 320x100
 */

.banner-ad {
  width: 320px;
  height: 100px;
}

@media(min-width: 468px) {
  .banner-ad {
    width: 468px;
  }
}

/*
 * Playwire desktop leaderboard:
 *  - 728x90
 *  - 970x250 (billboard; too tall)
 *  - 970x90
 */

@media(min-width: 728px) {
  .banner-ad {
    width: 728px;
  }
}

@media(min-width: 750px) {
  .banner-ad {
    width: 750px;
  }
}


@media(min-width: 970px) {
  .banner-ad {
    width: 970px;
    height: 180px;
  }
}

@media(min-width: 980px) {
  .banner-ad {
    width: 980px;
    height: 180px;
  }
}

/*
 * Playwire desktop skyscraper:
 *  - 160x600
 *  - 300x600
 */
.scraper-ad {
  height: 600px;
}

/* fill container margins */
@media(min-width: 1900px) {
  .scraper-ad {
    width: 160px;
  }
}

@media(min-width: 2200px) {
  .scraper-ad {
    width: 300px;
  }
}

/*
 * Playwire medium rectangle:
 *  - 300x250
 *  - 300x600 (half page)
 *  - 320x50
 */

/*
 * Section ad: Large rectangle on mobile, Billboard on desktop
 */
.section-ad {
  height: 250px;
  width: 320px;
}

@media(min-width: 468px) {
  .section-ad {
    width: 468px;
  }
}

@media(min-width: 728px) {
  .section-ad {
    height: 280px;
    width: 728px;
  }
}

@media(min-width: 970px) {
  .section-ad {
    width: 970px;
  }
}
</style>
