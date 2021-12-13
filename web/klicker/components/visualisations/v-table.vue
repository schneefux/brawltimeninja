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

    const show = computed(() => query.value.measurements.length < 5)

    const columns = computed<Column[]>(() => {
      const dimensionColumn: Column = {
        title: query.value.dimensions.map(d => $klicker.getName(d)).join(', '),
        keys: query.value.dimensions.map(d => `dimensions.${d.id}`),
        // dimensions are rendered n:m
        slot: 'dimensions',
      }

      let columns: Column[]
      if (!('comparingMeasurement' in query.value)) {
        columns = query.value.measurements.map(m => (<Column>{
          // measurements are rendered 1:1
          title: $klicker.getName(m),
          keys: [`measurements.${m.id}`],
          slot: `measurements.${m.id}`,
          shrink: true,
        }))
      } else {
        columns = [{
          title: i18n.t('comparison.reference.for.metric', { metric: $klicker.getName(query.value.comparingMeasurement) }) as string,
          keys: [`measurements.${query.value.comparingMeasurement.id}`],
          slot: `measurements.${query.value.comparingMeasurement.id}`,
          shrink: true,
        }, {
          title: i18n.t('comparison.difference') as string,
          keys: [`test.annotatedDifference`],
          slot: 'difference',
          shrink: true,
        }]
      }

      return [dimensionColumn, ...columns]
    })

    const rows = computed(() => query.value.data)

    // TODO add comparator v2 support to dashboard
    const link = computed(() => !('comparingMeasurement' in query.value) ? <Location>{
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
