<template>
  <div
    v-if="banner"
    class="mt-4"
  >
    <client-only v-if="allowed">
      <div class="flex justify-center -mx-4">
        <adsense
          :data-ad-slot="adSlot"
          :data-ad-region="adRegion"
          data-ad-format=""
          data-ad-client="ca-pub-6856963757796636"
          class="banner-ad"
          data-full-width-responsive
        ></adsense>
      </div>

      <template v-slot:placeholder>
        <div class="adswrapper ad-section banner-ad"></div>
      </template>
    </client-only>
  </div>
  <div v-else-if="scraper">
    <client-only v-if="allowed">
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
  >
    <client-only v-if="allowed && visible">
      <adsense
        :data-ad-slot="adSlot"
        :data-ad-region="adRegion"
        data-ad-format="auto"
        data-ad-client="ca-pub-6856963757796636"
        class="text-center"
        data-full-width-responsive
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
import { useIntersectionObserver } from '@vueuse/core'
import { isApp } from '~/composables/app'
import { usePreferencesStore } from '@/stores/preferences'

export default defineComponent({
  props: {
    adSlot: {
      type: String,
      required: true
    },
    adRegion: {
      type: String,
      required: false
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

    return {
      ad,
      visible,
      allowed,
    }
  },
})
</script>

<style lang="postcss">
.banner-ad {
  width: 320px;
  height: 100px;
}

@media(min-width: 468px) {
  .banner-ad {
    width: 468px;
  }
}

@media(min-width: 750px) {
  .banner-ad {
    width: 750px;
  }
}

@media(min-width: 980px) {
  .banner-ad {
    width: 980px;
    height: 180px;
  }
}

.scraper-ad {
  display: none;
  height: 600px;
}

/* fill container margins */
@media(min-width: 1900px) {
  .scraper-ad {
    display: block;
    width: 160px;
  }
}

@media(min-width: 2200px) {
  .scraper-ad {
    width: 300px;
  }
}
</style>
