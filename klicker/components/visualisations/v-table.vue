<template>
  <component
    :is="vwrapper.is"
    v-bind="vwrapper.props"
  >
    <template v-slot:content>
      <div class="h-full relative">
        <b-table
          :columns="columns"
          :rows="rows"
          :page-size="pageSize"
          :no-paginator="card == undefined"
          id-key="id"
          class="h-full w-full overflow-auto"
          ranked
        >
          <template
            v-for="m in metrics"
            v-slot:[`metrics.${m.id}`]="{ row }"
            :key="m.id"
          >
            <m-auto
              :response="response"
              :metric-id="m.id"
              :row="row"
            ></m-auto>
          </template>

          <template v-slot:dimensions="{ row }">
            <d-auto
              :response="response"
              :row="row"
              captioned
            ></d-auto>
          </template>
        </b-table>
      </div>
    </template>

    <template
      v-if="linkWithParams != undefined"
      v-slot:preview
    >
      <router-link
        :to="linkWithParams"
        class="opacity-75"
      >
        <fa :icon="faExternalLinkAlt"></fa>
      </router-link>
    </template>
  </component>
</template>

<script lang="ts">
import { VisualisationProps } from '../../props'
import BTable, { Column } from '../ui/b-table.vue'
import DAuto from './d-auto.vue'
import MAuto from './m-auto.vue'
import { computed, defineComponent, toRef } from 'vue'
import Fa from '../fa.vue'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { useCubeResponseProps } from '../../composables/response'
import { useKlickerConfig } from '../../composables/klicker'
import { useVWrapper, vwrappers } from '../../composables/vwrapper'

export default defineComponent({
  components: {
    Fa,
    BTable,
    DAuto,
    MAuto,
    ...vwrappers,
  },
  props: {
    ...VisualisationProps,
    pageSize: {
      type: Number,
      default: 10
    },
    linkPath: {
      type: String,
      required: false
    },
  },
  setup(props) {
    const { translate } = useKlickerConfig()
    const { $klicker, dimensions, metrics } = useCubeResponseProps(props)

    const columns = computed<Column[]>(() => {
      const columns: Column[] = []

      columns.push({
        title: dimensions.value.map(d => $klicker.getName(translate, d)).join(', '),
        keys: dimensions.value.map(d => `dimensions.${d.id}`),
        // dimensions are rendered n:m
        slot: 'dimensions',
        header: true,
      })
      metrics.value.forEach(m => columns.push({
        // metrics are rendered 1:1
        title: $klicker.getName(translate, m),
        keys: [`metrics.${m.id}`],
        slot: `metrics.${m.id}`,
        shrink: true,
        lightText: true,
      }))

      if (props.response.kind == 'comparingResponse') {
        columns.push({
          title: translate('comparison.difference.to.dataset', { dataset: props.response.query.reference.name ?? translate('comparison.dataset.reference') }),
          keys: [`test.difference.annotatedDifference`],
          slot: 'difference',
          shrink: true,
          lightText: true,
        })
      }

      return columns
    })

    const rows = computed(() => props.response.data)

    const linkWithParams = computed(() => {
      if (props.card != undefined && props.linkPath != undefined) {
        return {
          path: props.linkPath,
          ...$klicker.convertQueryToLocation(props.response.query),
        }
      } else {
        return undefined
      }
    })

    const vwrapper = useVWrapper(toRef(props, 'card'), toRef(props, 'loading'))

    return {
      vwrapper,
      rows,
      columns,
      linkWithParams,
      faExternalLinkAlt,
      metrics,
    }
  },
})
</script>
