<template>
  <div
    v-if="banner"
    class="mt-4"
  >
    <client-only v-if="allowed">
      <adsense
        :data-ad-slot="adSlot"
        :data-ad-region="adRegion"
        data-ad-format=""
        data-ad-client="ca-pub-6856963757796636"
        data-full-width-responsive="true"
        ins-class="banner-ad"
        class="flex justify-center -mx-4"
      ></adsense>

      <div
        slot="placeholder"
        class="adswrapper ad-section banner-ad"
      ></div>
    </client-only>
  </div>
  <div v-else-if="scraper">
    <client-only v-if="allowed">
      <adsense
        :data-ad-slot="adSlot"
        :data-ad-region="adRegion"
        data-ad-format=""
        data-ad-client="ca-pub-6856963757796636"
        ins-class="scraper-ad"
      ></adsense>

      <div
        slot="placeholder"
        class="adswrapper ad-section scraper-ad"
      ></div>
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
        data-full-width-responsive="yes"
        class="text-center"
      ></adsense>

      <div
        slot="placeholder"
        class="adswrapper ad-section w-full"
        style="height: 300px;"
      ></div>
    </client-only>
  </b-page-section>
</template>

<script lang="ts">
import { defineComponent, useStore, computed, ref } from '@nuxtjs/composition-api'
import { useIntersectionObserver } from '@vueuse/core'

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
    const store = useStore<any>()
    const isApp = computed(() => store.state.isApp as boolean)
    const ad = ref<HTMLElement>()
    const visible = ref(!props.lazy || props.first)
    const allowed = computed(() => props.first || !isApp.value)

    if (process.client && allowed.value && !visible.value) {
      // TODO the fix for https://github.com/vueuse/vueuse/issues/685
      // and/or importing vueuse as peer dependency breaks this ref type
      const { isSupported, stop } = useIntersectionObserver(ad as any, ([{ isIntersecting }]) => {
        if (isIntersecting) {
          visible.value = isIntersecting
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
      isApp,
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
