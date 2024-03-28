<template>
  <div
    ref="placement"
    :data-id="adId"
    class="vm-placement"
  ></div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeUnmount, nextTick, onMounted } from 'vue'

export default defineComponent({
  props: {
    adId: {
      type: String,
      required: true
    },
    // TODO can I set data-publisher-ref?
  },
  setup() {
    const placement = ref<HTMLDivElement>()

    // log statements were requested by Venatus
    const addPlacement = (el: HTMLElement) => {
      window.top!.__vm_add = window.top!.__vm_add || []
      window.top!.__vm_add.push(el)
      console.log('Venatus : vm_add : ', el)
    }

    const removePlacement = (el: HTMLElement) => {
      window.top!.__vm_remove = window.top!.__vm_remove || []
      window.top!.__vm_remove.push(el)
      console.log('Venatus : vm_remove : ', el)
    }

    onMounted(() => {
      nextTick(() => {
        if (placement.value != null) {
          addPlacement(placement.value)
        }
      })
    })

    onBeforeUnmount(() => {
      if (placement.value != null) {
        removePlacement(placement.value)
      }
    })

    return {
      placement,
    }
  },
})
</script>
