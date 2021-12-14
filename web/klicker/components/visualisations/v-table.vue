<template>
  <!-- FIXME SSR sometimes breaks due to inheritAttrs and b-card (?) -->
  <b-card
    v-if="show"
    v-bind="$attrs"
  >
    <div slot="content" class="h-full relative">
      <b-table
        :columns="columns"
        :rows="rows"
        :page-size="pageSize"
        id-key="id"
        class="font-semibold text-sm md:text-lg h-full overflow-auto"
        ranked
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
      </b-table>

      <b-button
        v-if="showLink"
        :to="link"
        class="absolute bottom-0 left-0 mb-1 -ml-2"
        dark
        xs
      >
        <font-awesome-icon
          :icon="faExternalLinkAlt"
        ></font-awesome-icon>
      </b-button>
    </div>
  </b-card>
</template>

<script lang="ts">
import { CubeResponse, CubeResponseTest } from '~/klicker'
import BTable, { Column } from '~/klicker/components/ui/b-table.vue'
import BButton from '~/klicker/components/ui/b-button.vue'
import BCard from '~/klicker/components/ui/b-card.vue'
import { Location } from 'vue-router'
import { computed, defineComponent, PropType, toRefs, useContext } from '@nuxtjs/composition-api'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'

export default defineComponent({
  components: {
    BTable,
    BCard,
    BButton,
  },
  inheritAttrs: false,
  props: {
    query: {
      type: Object as PropType<CubeResponse|CubeResponseTest>,
      required: true
    },
    pageSize: {
      type: Number,
      default: 10
    },
  },
  setup(props) {
    const { $klicker, route, i18n } = useContext()
    const { query } = toRefs(props)

    const show = computed(() => 'test' in query.value || query.value.state.measurementsIds.length < 5)

    const columns = computed<Column[]>(() => {
      let columns: Column[] = []
      if (!('test' in query.value)) {
        const state = query.value.state
        const dimensions = $klicker.getDimensions(state)
        const measurements = $klicker.getMeasurements(state)

        columns.push({
          title: dimensions.map(d => $klicker.getName(d)).join(', '),
          keys: dimensions.map(d => `dimensions.${d.id}`),
          // dimensions are rendered n:m
          slot: 'dimensions',
        })
        measurements.forEach(m => columns.push({
          // measurements are rendered 1:1
          title: $klicker.getName(m),
          keys: [`measurements.${m.id}`],
          slot: `measurements.${m.id}`,
          shrink: true,
        }))
      } else {
        const state = query.value.state
        const dimensions = $klicker.getDimensions(state.reference)

        columns.push({
          title: dimensions.map(d => $klicker.getName(d)).join(', '),
          keys: dimensions.map(d => `dimensions.${d.id}`),
          // dimensions are rendered n:m
          slot: 'dimensions',
        })
        const comparingMeasurement = $klicker.getComparingMeasurement(state)
        columns.push({
          title: i18n.t('comparison.reference.for.metric', { metric: $klicker.getName(comparingMeasurement) }) as string,
          keys: [`measurements.${state.comparingMeasurementId}`],
          slot: `measurements.${state.comparingMeasurementId}`,
          shrink: true,
        })
        columns.push({
          title: i18n.t('comparison.difference') as string,
          keys: [`test.annotatedDifference`],
          slot: 'difference',
          shrink: true,
        })
      }

      return columns
    })

    const rows = computed(() => query.value.data)

    // TODO add comparator v2 support to dashboard
    const link = computed(() => !('comparingMeasurementId' in query.value.state) ? <Location>{
      ...$klicker.stateToLocation(query.value.state),
      path: '/dashboard',
    } : {})

    const showLink = computed(() => route.value.path != '/dashboard' && !('comparingMeasurement' in query.value))

    return {
      show,
      link,
      rows,
      columns,
      showLink,
      faExternalLinkAlt,
    }
  },
})
</script>
