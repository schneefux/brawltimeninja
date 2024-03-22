<template>
  <!-- Stickies -->
  <venatus-placement
    ad-id="65f9504e767223575b4de5b7"
    class="hidden"
  ></venatus-placement>
  <!-- Instream -->
  <venatus-placement
    ad-id="65f9505add5aea6a13fd04ab"
    class="hidden"
  ></venatus-placement>
</template>

<script lang="ts">
import { defineComponent, onUnmounted } from 'vue'

export default defineComponent({
  setup(props) {
    const removeAllRichmedia = () => {
      window.top!.__vm_remove_category = window.top!.__vm_remove_category || []
      window.top!.__vm_remove_category.push('richmedia_all')
    }

    onUnmounted(() => removeAllRichmedia())
  },
})
</script>

<style lang="postcss">
.vm-footer {
  @apply max-md:bottom-14 !important; /* 3.5rem (14) for footer */
}

/* TODO push instream video player too */
avp-player-ui {
  /* push video player above footers */
  /* 3.5rem (14) for footer + 50px for mobile footer ad + 0.5rem padding */
  --avb-offset-bottom: 115px !important;

  --avb-offset-right: 8px !important;
}
</style>
