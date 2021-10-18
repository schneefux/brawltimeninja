<template>
  <b-card
    :title="$t('starpower-gadget-data.disclaimer.title')"
    v-bind="$attrs"
  >
    <p slot="content" class="prose text-gray-200 mb-2">
      {{ $t('starpower-gadget-data.disclaimer.description') }}
    </p>
  </b-card>
</template>

<script>
import { defineComponent } from "@nuxtjs/composition-api";

export default defineComponent({
  inheritAttrs: false,
})
</script>
