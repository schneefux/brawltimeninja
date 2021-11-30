<template>
  <b-card
    v-if="measurement.description != undefined"
    :title="`About ${measurement.name}`"
    v-bind="$attrs"
  >
    <p slot="content" class="prose text-gray-200">
      {{ measurement.description }}
    </p>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { Measurement } from '~/klicker'

export default defineComponent({
  inheritAttrs: false,
  props: {
    measurement: {
      type: Object as PropType<Measurement>,
      required: true
    },
  },
})
</script>
