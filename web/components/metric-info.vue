<template>
  <b-card
    v-if="metric.description != undefined"
    :title="$t('about-metric', { metric: $t('metric.' + metric.id) })"
    v-bind="$attrs"
  >
    <template v-slot:content><p >
      {{ $t('brawler.disclaimer') }}
      {{ metric.description }}
    </p></template>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
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
