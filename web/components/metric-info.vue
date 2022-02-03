<template>
  <b-card
    v-if="metric.description != undefined"
    :title="$t('about-metric', { metric: $t('metric.' + metric.id) })"
    v-bind="$attrs"
  >
    <p slot="content">
      {{ metric.description }}
    </p>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { Metric } from '@schneefux/klicker/types'

export default defineComponent({
  inheritAttrs: false,
  props: {
    metric: {
      type: Object as PropType<Metric>,
      required: true
    },
  },
})
</script>
