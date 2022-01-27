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
        v-if="linkWithParams != undefined"
        :to="linkWithParams"
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
import { VisualisationProps } from '../../props'
import BTable, { Column } from '../ui/b-table.vue'
import BButton from '../ui/b-button.vue'
import { Location } from 'vue-router'
import { computed, defineComponent } from 'vue-demi'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { useCubeResponseProps } from '../../composables/response'
import VCardWrapper from './v-card-wrapper.vue'

export default defineComponent({
  components: {
    FontAwesomeIcon,
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
    linkPath: {
      type: String,
      required: false
    },
  },
  setup(props) {
    const { $klicker, dimensions, metrics } = useCubeResponseProps(props)

    const columns = computed<Column[]>(() => {
      let columns: Column[] = []

      columns.push({
        title: dimensions.value.map(d => $klicker.getName(d)).join(', '),
        keys: dimensions.value.map(d => `dimensions.${d.id}`),
        // dimensions are rendered n:m
        slot: 'dimensions',
      })
      metrics.value.forEach(m => columns.push({
        // metrics are rendered 1:1
        title: $klicker.getName(m),
        keys: [`metrics.${m.id}`],
        slot: `metrics.${m.id}`,
        shrink: true,
      }))

      if (props.response.kind == 'comparingResponse') {
        columns.push({
          title: $klicker.$t('comparison.difference.to.dataset', { dataset: $klicker.$t('comparison.dataset.reference') as string }) as string,
          keys: [`test.difference.annotatedDifference`],
          slot: 'difference',
          shrink: true,
        })
      }

      return columns
    })

    const rows = computed(() => props.response.data)

    const linkWithParams = computed<Location|undefined>(() => {
      if (props.card != undefined && props.linkPath != undefined) {
        return {
          path: props.linkPath,
          ...$klicker.convertQueryToLocation(props.response.query),
        }
      } else {
        return undefined
      }
    })

    return {
      rows,
      columns,
      linkWithParams,
      faExternalLinkAlt,
    }
  },
})
</script>
