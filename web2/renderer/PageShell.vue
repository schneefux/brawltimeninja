<template>
  <slot />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import '~/assets/css/tailwind.css'
import '~/assets/css/transitions.css'
import '~/assets/css/fonts.css'

if (import.meta.env.DEV) {
  import('~/assets/css/development.css')
}

export default defineComponent({})
</script>
