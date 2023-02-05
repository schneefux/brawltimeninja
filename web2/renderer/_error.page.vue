<template>
  <error-layout>
    <error></error>
  </error-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ErrorLayout from '~/layouts/error.vue'
import '~/assets/css/tailwind.css'
import '~/assets/css/transitions.css'
import '~/assets/css/fonts.css'
import Error from '../pages/error.vue'

export default defineComponent({
  components: {
    Error,
    ErrorLayout,
  },
})
</script>
