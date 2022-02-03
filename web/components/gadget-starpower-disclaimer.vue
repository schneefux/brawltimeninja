<template>
   <component
    :is="card ? 'b-card' : 'div'"
    :title="$t('starpower-gadget-data.disclaimer.title')"
    full-height
  >
    <p slot="content">
      {{ $t('starpower-gadget-data.disclaimer.description') }}
    </p>
   </component>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { BCard } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BCard,
  },
  props: {
    card: {
      type: Boolean,
      default: false
    },
  },
})
</script>
