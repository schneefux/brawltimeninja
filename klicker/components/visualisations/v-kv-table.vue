<template>
  <v-card-wrapper
    v-bind="$props"
    component="v-bigstats"
  >
    <b-kv-table
      slot="content"
      id-key="id"
      :rows="rows"
      :data="data"
    >
      <template
        v-for="(_, name) in $scopedSlots"
        v-slot:[name]="data"
      >
        <slot
          :name="name"
          v-bind="data"
        ></slot>
      </template>
    </b-kv-table>
  </v-card-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue-demi'
import { VisualisationProps } from '../../props'
import { useCubeResponseProps } from '../../composables/response'
import BKvTable, { Row } from '../ui/b-kv-table.vue'
import VCardWrapper from './v-card-wrapper.vue'

/**
 * Table visualisation with metrics on the Y axis and a single value on the X axis
 */
export default defineComponent({
  components: {
    VCardWrapper,
    BKvTable,
  },
  name: 'VKvTable',
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { $klicker, metrics, switchResponse } = useCubeResponseProps(props)

    const rows = computed<Row[]>(() => {
      let rows: Row[] = []

      switchResponse(response => {
        metrics.value.forEach(m => {
          rows.push({
            title: $klicker.getName(m),
            key: `metrics.${m.id}`,
            slot: `metrics.${m.id}`,
          })
        })
      }, response => {
        metrics.value.forEach(m => {
          rows.push({
            title: (response.query.name ?? $klicker.$t('comparison.dataset.test') as string) + ' ' + $klicker.getName(m),
            key: `metrics.${m.id}`,
            slot: `metrics.${m.id}`,
          })

          rows.push({
            title: (response.query.reference.name ?? $klicker.$t('comparison.dataset.reference') as string) + ' ' + $klicker.getName(m),
            key: `test.reference.metrics.${m.id}`,
            slot: `metrics.${m.id}`,
          })
        })
      })

      return rows
    })

    const data = computed(() => props.response.data[0])

    return {
      rows,
      data,
    }
  },
})
</script>
