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
          captioned
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
    const { $klicker, metrics } = useCubeResponseProps(props)

    const rows = computed<Row[]>(() => {
      let rows: Row[] = []

      metrics.value.forEach(m => rows.push({
        title: $klicker.getName(m),
        key: `metrics.${m.id}`,
        slot: `metrics.${m.id}`,
      }))

      if (props.response.kind == 'comparingResponse') {
        rows.push({
          title: $klicker.$t('comparison.difference.to.dataset', { dataset: $klicker.$t('comparison.dataset.reference') as string }) as string,
          key: 'test.difference.annotatedDifference',
          slot: 'difference',
        })
      }

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
