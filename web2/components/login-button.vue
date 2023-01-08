<template>
  <a :href="loginUrl">
    <img src="~/assets/images/google_login.png">
  </a>
</template>

<script lang="ts">
import { useContext } from "@/composables/compat";
import { computed, defineComponent } from "vue";

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
