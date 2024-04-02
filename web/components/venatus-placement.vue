<template>
  <div
    ref="placement"
    :data-id="adId"
    :ad-type="adType"
    :data-display-type="adType == 'hybrid-banner' ? 'hybrid-banner' : undefined"
    :style="adType == 'rich-media' ? 'display: none' : undefined"
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
    adType: {
      type: String,
      default: 'desktop-ad'
    },
    // TODO can I set data-publisher-ref?
  },
  setup(props) {
    const placement = ref<HTMLDivElement>()

    // log statements were requested by Venatus
    const addPlacement = (el: HTMLElement) => {
      window.top!.__vm_add = window.top!.__vm_add || []
      window.top!.__vm_add.push(el)
      console.log(`_vm_add, mount of ${props.adId} Venatus ${props.adType} ad`, el)
    }

    const removePlacement = (el: HTMLElement) => {
      if (props.adType == 'rich-media') {
        window.top!.__vm_remove_category = window.top!.__vm_remove_category || []
        window.top!.__vm_remove_category.push('richmedia_all')
        console.log(`_vm_remove by category: Rich Media, ${props.adId}`, el)
      } else {
        window.top!.__vm_remove = window.top!.__vm_remove || []
        window.top!.__vm_remove.push(el)
        console.log(`_vm_remove placement: ${props.adId} Venatus ${props.adType} ad`, el)
      }
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
