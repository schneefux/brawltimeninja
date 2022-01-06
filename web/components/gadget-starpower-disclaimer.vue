<template>
  <b-card
    :title="$t('starpower-gadget-data.disclaimer.title')"
    v-bind="$attrs"
  >
    <p slot="content" class="prose prose-invert">
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
