<template>
  <ins
    :id="id"
    class="inline-block"
  ></ins>
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
        // insert & immediate remove does not work due to async issue, so skip both
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

<style lang="postcss">
#pw-oop-bottom_rail {
  /* push bottom rail above sticky footer (global style) */
  @apply max-md:bottom-14 !important;
  /* remove padding which pushes the unit out of the container (?) */
  @apply pt-0 !important;
}

#tyche_trendi_video_container {
  /* push video player above bottom rail and sticky footer */
  @apply max-md:bottom-[115px] !important; /* 3.5rem (14) for footer + 50px for rail + 0.5rem padding */
}

.pw-sticky {
  /* push sticky in-content ads below sticky header elements */
  @apply max-md:top-28 !important; /* 3rem (12) for scroll spy nav + 3.5rem (14) for sticky header + 0.5rem (2) padding */
}

/* add paddings to bottom of the page so that the rail (106px) does not overlap any content */
#main {
  @apply max-md:mb-[106px] !important;
}
#footer {
  @apply md:pb-[calc(106px+16px)] !important;
}
</style>
