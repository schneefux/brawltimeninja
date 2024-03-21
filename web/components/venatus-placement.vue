<template>
  <div
    :ref="el => updateVm(el)"
    :data-id="adId"
    class="vm-placement"
  ></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    adId: {
      type: String,
      required: true
    },
  },
  setup() {
    const updateVm = (el: any) => {
      if (el != null) {
        window.top!.__vm_add = window.top!.__vm_add || []
        window.top!.__vm_add.push(el)
      } else {
        const addIndex = window.top!.__vm_remove?.indexOf(el)
        if (addIndex != -1) {
          // not added yet
          window.top!.__vm_add.splice(addIndex, 1)
        } else {
          window.top!.__vm_remove = window.top!.__vm_remove || []
          window.top!.__vm_remove.push(el)
        }
      }
    }

    return {
      updateVm,
    }
  },
})
</script>
