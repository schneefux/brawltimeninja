<template>
   <component
    :is="card ? 'b-card' : 'div'"
    :title="$t('starpower-gadget-data.disclaimer.title')"
  >
    <template v-if="card" v-slot:content>
      <p>
        {{ $t('starpower-gadget-data.disclaimer.description') }}
      </p>
    </template>
    <p v-if="!card">
      {{ $t('starpower-gadget-data.disclaimer.description') }}
    </p>
   </component>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
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
