<template>
  <ins :id="id"></ins>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted, onUnmounted, PropType } from 'vue'
import { TaggedType } from '~/composables/playwire-ramp'

export default defineComponent({
  props: {
    adId: {
      type: String,
      required: true
    },
    instance: {
      type: String,
      default: '1'
    },
    type: {
      type: String as PropType<TaggedType>,
      required: true
    },
  },
  setup(props) {
    const id = `pw-${props.adId}-${props.instance}`
    const activeSlot = ref<string>()

    const addAdFun = () => {
      window.ramp
        .addUnits([{
          type: props.type,
          selectorId: id,
        }])
        .then(() => {
          for (const slotName in window.ramp.settings.slots) {
            const slot = window.ramp.settings.slots[slotName]
            if (slot.element && slot.element.parentElement && slot.element.parentElement.id == id) {
              activeSlot.value = slotName
            }
          }
        })
        .catch((e: any) => console.warn(e))
        .finally(() => window.ramp.displayUnits())
    }

    const removeAdFun = () => {
      if (activeSlot.value) {
        window.ramp.destroyUnits(activeSlot.value)
          .then(() => activeSlot.value = undefined)
          .catch((e: any) => console.warn(e))
      }
    }

    onMounted(() => {
      if (window.ramp.que.includes(removeAdFun)) {
        // see below
        window.ramp.que = window.ramp.que.filter((f) => f != removeAdFun)
      } else {
        if (!window.ramp.que.includes(addAdFun)) {
          window.ramp.que.push(addAdFun);
        }
      }
    })

    onUnmounted(() => {
      if (window.ramp.que.includes(addAdFun)) {
        // insert & remove does not work due to async issue, so skip both
        window.ramp.que = window.ramp.que.filter((f) => f != addAdFun)
      } else {
        if (!window.ramp.que.includes(removeAdFun)) {
          window.ramp.que.push(removeAdFun)
        }
      }
    })

    return {
      id,
    }
  },
})
</script>

<style scoped>
ins {
  display: block;
}
</style>

<style lang="postcss">
/* push above sticky footer (global style) */
#pw-oop-bottom_rail {
  @apply bottom-14 lg:bottom-0 !important;
}

/* add padding to bottom of page so that the rail does not overlap any content */
main {
  margin-bottom: 138 !important; /* 106px for the rail + 32px (mb-8) as usual */
}
</style>
