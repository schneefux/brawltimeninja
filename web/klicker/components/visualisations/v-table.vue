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
import { computed, defineComponent, PropType, useContext } from '@nuxtjs/composition-api'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { useCubeResponse } from '~/klicker/composables/response'
import { convertQueryToLocation } from '~/klicker/composables/link'

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
    const { route, i18n } = useContext()

    const show = computed(() => props.response.kind == 'comparingResponse' || props.response.query.measurementsIds.length < 5)
    const { $klicker, dimensions, measurements } = useCubeResponse(props)

    const columns = computed<Column[]>(() => {
      let columns: Column[] = []

      columns.push({
        title: dimensions.value.map(d => $klicker.getName(d)).join(', '),
        keys: dimensions.value.map(d => `dimensions.${d.id}`),
        // dimensions are rendered n:m
        slot: 'dimensions',
      })
      measurements.value.forEach(m => columns.push({
        // measurements are rendered 1:1
        title: $klicker.getName(m),
        keys: [`measurements.${m.id}`],
        slot: `measurements.${m.id}`,
        shrink: true,
      }))

      if (props.response.kind == 'comparingResponse') {
        columns.push({
          title: i18n.t('comparison.difference.to.dataset', { dataset: i18n.t('comparison.dataset.reference') as string }) as string,
          keys: [`test.difference.annotatedDifference`],
          slot: 'difference',
          shrink: true,
        })
      }

      return columns
    })

    const rows = computed(() => props.response.data)

    const link = computed(() => <Location>{
      ...convertQueryToLocation(props.response.query),
      path: '/dashboard',
    })

    const showLink = computed(() => route.value.path != '/dashboard')

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
