<template>
  <!-- always wrap in <client-only> -->
  <div class="contents">
    <slot v-if="activeVariant == '0'"></slot>
    <slot
      v-else
      :name="activeVariant"
    ></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, wrapProperty } from '@nuxtjs/composition-api'

const useGtag = wrapProperty('$gtag', false)
export default defineComponent({
  props: {
    experimentId: {
      type: String,
      required: true
    },
    debug: {
      type: String
    },
  },
  setup(props) {
    const activeVariant = ref(props.debug || '0')
    let callback: ((v: string) => void)|undefined = undefined

    const gtag = useGtag()
    onMounted(() => {
      callback = (value) => {
        value ??= '0' // deactivated -> undefined
        console.log('enabling variant ' + value + ' for experiment ' + props.experimentId)
        activeVariant.value = value
      }
      gtag.event('optimize.callback', {
        name: props.experimentId,
        callback,
      })
      // https://support.google.com/optimize/answer/7008840
      gtag.event('optimize.activate', {
        non_interaction: true,
      })
    })

    onUnmounted(() => {
      if (process.client && callback != undefined) {
        gtag.event('optimize.callback', {
          name: props.experimentId,
          callback,
          remove: true,
        })
      }
    })

    return {
      activeVariant,
    }
  },
})
</script>
