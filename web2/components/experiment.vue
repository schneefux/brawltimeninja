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
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { event } from 'vue-gtag'

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

    onMounted(() => {
      callback = (value) => {
        value ??= '0' // deactivated -> undefined
        console.log('enabling variant ' + value + ' for experiment ' + props.experimentId)
        activeVariant.value = value
      }
      event('optimize.callback', {
        name: props.experimentId,
        callback,
      })
      // https://support.google.com/optimize/answer/7008840
      event('optimize.activate', {
        non_interaction: true,
      })
    })

    onUnmounted(() => {
      if (!import.meta.env.SSR && callback != undefined) {
        event('optimize.callback', {
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
