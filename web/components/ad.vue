<template>
  <b-page-section ref="ad">
    <client-only v-if="allowed && visible">
      <adsense
        :data-ad-slot="adSlot"
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
    first: {
      type: Boolean,
      default: false
    },
    lazy: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const store = useStore<any>()
    const isApp = computed(() => store.state.isApp as boolean)
    const ad = ref<HTMLElement|null>()
    const visible = ref(!props.lazy || props.first)
    const allowed = computed(() => props.first || !isApp.value)

    if (process.client && allowed.value && !visible.value) {
      const { isSupported, stop } = useIntersectionObserver(ad, ([{ isIntersecting }]) => {
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
