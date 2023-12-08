<template>
  <a :href="loginUrl">
    <img :src="googleLoginIcon">
  </a>
</template>

<script lang="ts">
import { useConfig } from "~/composables/compat";
import { computed, defineComponent } from "vue";
import googleLoginIcon from "~/assets/images/google_login.png";

export default defineComponent({
  setup() {
    const $config = useConfig()

    const loginUrl = computed(() => $config.managerUrl + '/oauth/google')

    return {
      loginUrl,
      googleLoginIcon,
    }
  },
})
</script>
