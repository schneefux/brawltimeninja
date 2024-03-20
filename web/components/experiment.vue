<template>
  <slot :name="activeVariant"></slot>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import Cookies from 'js-cookie'
import { set as gtagSet } from 'vue-gtag'

export default defineComponent({
  props: {
    experimentId: {
      type: String,
      required: true,
    },
    debug: {
      type: String
    },
  },
  setup(props, { slots }) {
    const activeVariant = ref(props.debug || '')

    onMounted(() => {
      // supports only a single experiment at the moment

      const cookieName = 'experiment'
      let selectedVariant = Cookies.get(cookieName)
      if (selectedVariant == undefined) {
        const variants = Object.keys(slots)
        selectedVariant = variants[Math.floor(Math.random() * variants.length)]
        Cookies.set(cookieName, selectedVariant, { expires: 31 })
        console.log('selected variant ' + selectedVariant + ' for experiment ' + props.experimentId)
      }

      activeVariant.value = selectedVariant;

      (gtagSet as any)('user_properties', {
        'test_group': `${props.experimentId}-${activeVariant.value}`,
      })

      console.log('enabled variant ' + activeVariant.value + ' for experiment ' + props.experimentId)
    })

    return {
      activeVariant,
    }
  },
})
</script>
