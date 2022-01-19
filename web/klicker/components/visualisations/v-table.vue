<template>
  <v-card-wrapper
    v-bind="$props"
    component="v-table"
  >
    <div slot="content" class="h-full relative">
      <b-table
        :columns="columns"
        :rows="rows"
        :page-size="pageSize"
        :no-paginator="card == undefined"
        id-key="id"
        class="text-sm md:text-base h-full overflow-auto"
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
        class="absolute bottom-0 left-0 -ml-2"
        dark
        xs
      >
        <font-awesome-icon
          :icon="faExternalLinkAlt"
        ></font-awesome-icon>
      </b-button>
    </div>
  </v-card-wrapper>
</template>

<script lang="ts">
import { VisualisationProps } from '~/klicker/props'
import BTable, { Column } from '~/klicker/components/ui/b-table.vue'
import BButton from '~/klicker/components/ui/b-button.vue'
import { Location } from 'vue-router'
import { computed, defineComponent, useContext } from '@nuxtjs/composition-api'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { useCubeResponseProps } from '~/klicker/composables/response'
import { convertQueryToLocation } from '~/klicker/composables/link'
import VCardWrapper from '~/klicker/components/visualisations/v-card-wrapper.vue'

export default defineComponent({
  components: {
    BTable,
    BButton,
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
    pageSize: {
      type: Number,
      default: 10
    },
  },
  setup(props) {
    const { route, i18n } = useContext()

    const { $klicker, dimensions, measurements } = useCubeResponseProps(props)

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

    const showLink = computed(() => props.card != undefined && route.value.path != '/dashboard')

    return {
      link,
      rows,
      columns,
      showLink,
      faExternalLinkAlt,
    }
  },
})
</script>
