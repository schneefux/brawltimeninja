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
import { CubeResponse, CubeComparingResponse } from '~/klicker'
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
    response: {
      type: Object as PropType<CubeResponse|CubeComparingResponse>,
      required: true
    },
    pageSize: {
      type: Number,
      default: 10
    },
  },
  setup(props) {
    const { $klicker, route, i18n } = useContext()
    const { response } = toRefs(props)

    const show = computed(() => response.value.kind == 'comparingResponse' || response.value.query.measurementsIds.length < 5)

    const columns = computed<Column[]>(() => {
      let columns: Column[] = []

      const query = response.value.query
      const dimensions = $klicker.getDimensions(query)
      const measurements = $klicker.getMeasurements(query)

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

      if (response.value.kind == 'comparingResponse') {
        columns.push({
          title: i18n.t('comparison.difference.to.dataset', { dataset: i18n.t('comparison.dataset.reference') as string }) as string,
          keys: [`test.difference.annotatedDifference`],
          slot: 'difference',
          shrink: true,
        })
      }

      return columns
    })

    const rows = computed(() => response.value.data)

    // TODO add comparator v2 support to dashboard
    const link = computed(() => response.value.kind == 'response' ? <Location>{
      ...$klicker.queryToLocation(response.value.query),
      path: '/dashboard',
    } : {})

    const showLink = computed(() => route.value.path != '/dashboard' && !('comparingMeasurement' in response.value))

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
