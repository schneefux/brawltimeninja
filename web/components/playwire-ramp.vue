<template>
  <ins :id="id"></ins>
</template>

<script lang="ts">
import { id } from 'vega'
import { defineComponent, onMounted, onUnmounted, PropType } from 'vue'
import { TaggedType } from '~/composables/playwire-ramp'

export default defineComponent({
  props: {
    adId: {
      type: String,
      required: true
    },
    type: {
      type: String as PropType<TaggedType>,
      required: true
    },
  },
  setup(props) {
    const id = `pw-${props.adId}`

    onMounted(() => {
      window.ramp.que.push(() => {
        window.ramp
          .addUnits([{
            type: props.type,
            selectorId: id,
          }])
          .catch((e: any) => console.warn(e))
          .finally(() => window.ramp.displayUnits())
      });
    })

    onUnmounted(() => {
      window.ramp.que.push(() => {
        // possible that component was removed before first ad was created
        if (!window.ramp.settings || !window.ramp.settings.slots) return

        let slotToRemove = null
        Object.entries(window.ramp.settings.slots).forEach(([slotName, slot]: any[]) => {
          if (slot.element && slot.element.parentElement && slot.element.parentElement.id === id) {
            slotToRemove = slotName;
          }
        })

        if (slotToRemove) {
          window.ramp.destroyUnits(slotToRemove)
        }
      })
    })

    return {
      id,
    }
  },
})
</script>
