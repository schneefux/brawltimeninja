<template>
  <a :href="loginUrl">
    <img src="~/assets/images/google_login.png">
  </a>
</template>

<script lang="ts">
import { computed, defineComponent, useContext } from "@nuxtjs/composition-api";

export default defineComponent({
  setup() {
    const { $config } = useContext()

    const loginUrl = computed(() => $config.managerUrl + '/oauth/google')

    return {
      loginUrl,
    }
  },
})
</script>
