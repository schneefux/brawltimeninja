<template>
  <v-card-wrapper
    v-bind="$props"
    component="v-grid"
  >
    <template v-slot:content>
      <div class="flex flex-wrap justify-center gap-4">
        <b-card
          v-for="(entry, index) in response.data.slice(page*pageSize, (page+1)*pageSize)"
          :key="entry.id"
          :title="dimensions.map(d => entry.dimensions[d.id]).join(', ')"
          :elevation="(card && card.elevation || 1) + 1"
        >
          <template v-slot:preview>
            <span class="text-right text-lg text-text/75">#{{ index + page*pageSize + 1 }}</span>
          </template>

          <template v-slot:content>
            <div class="grid grid-cols-[auto,1fr] gap-x-4">
              <d-auto
                tag="div"
                :response="response"
                :row="entry"
              ></d-auto>

              <b-kv-table
                id-key="id"
                :rows="rows"
                :data="entry"
              >
                <template
                  v-for="m in metrics"
                  v-slot:[`metrics.${m.id}`]="{ row }"
                >
                  <m-auto
                    :key="m.id"
                    :response="response"
                    :metric-id="m.id"
                    :row="row"
                  ></m-auto>
                </template>
              </b-kv-table>
            </div>
          </template>
        </b-card>
      </div>
    </template>

    <template v-slot:actions>
      <b-paginator
        v-if="card != undefined && response.data.length > pageSize"
        v-model="page"
        :pages="Math.ceil(response.data.length / pageSize)"
        class="pt-4 mt-auto mx-auto"
      ></b-paginator>
    </template>
  </v-card-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { VisualisationProps } from '../../props'
import { useCubeResponseProps } from '../../composables/response'
import VCardWrapper from './v-card-wrapper.vue'
import BCard from '../ui/b-card.vue'
import BPaginator from '../ui/b-paginator.vue'
import BKvTable, { Row } from '../ui/b-kv-table.vue'
import DAuto from './d-auto.vue'
import MAuto from './m-auto.vue'
import { useKlicker } from '../../composables'

export default defineComponent({
  components: {
    BPaginator,
    BKvTable,
    BCard,
    VCardWrapper,
    DAuto,
    MAuto,
  },
  props: {
    ...VisualisationProps,
    pageSize: {
      type: Number,
      default: 6
    },
  },
  setup(props) {
    const { translate } = useKlicker()
    const { $klicker, dimensions, metrics } = useCubeResponseProps(props)

    const page = ref(0)
    watch(() => props.response.data, () => page.value = 0)

    const rows = computed<Row[]>(() => {
      let rows: Row[] = []

      metrics.value.forEach(m => rows.push({
        title: $klicker.getName(m),
        key: `metrics.${m.id}`,
        slot: `metrics.${m.id}`,
      }))

      if (props.response.kind == 'comparingResponse') {
        rows.push({
          title: translate('comparison.difference.to.dataset', { dataset: translate('comparison.dataset.reference') }),
          key: 'test.difference.annotatedDifference',
          slot: 'difference',
        })
      }

      return rows
    })

    return {
      page,
      rows,
      dimensions,
      metrics,
    }
  },
})
</script>
