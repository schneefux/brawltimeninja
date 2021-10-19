<template>
  <client-only>
    <!-- FIXME SSR breaks due to inheritAttrs and b-card -->
    <b-card
      v-if="measurements.length < 5"
      v-bind="$attrs"
    >
      <div slot="content" class="h-full relative">
        <b-table
          slot="content"
          :columns="columns"
          :rows="data"
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
  </client-only>
</template>

<script lang="ts">
import { Dimension, Measurement, MetaGridEntry, State } from '~/klicker'
import BTable, { Column } from '~/klicker/components/ui/b-table.vue'
import BButton from '~/klicker/components/ui/b-button.vue'
import BCard from '~/klicker/components/ui/b-card.vue'
import { Location } from 'vue-router'
import { computed, defineComponent, PropType, useContext } from '@nuxtjs/composition-api'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'

export default defineComponent({
  components: {
    BTable,
    BCard,
    BButton,
  },
  inheritAttrs: false,
  props: {
    data: {
      type: Array as PropType<MetaGridEntry[]>
    },
    dimensions: {
      type: Array as PropType<Dimension[]>,
      required: true
    },
    measurements: {
      type: Array as PropType<Measurement[]>,
      required: true
    },
    state: {
      type: Object as PropType<State>,
      required: true
    },
    pageSize: {
      type: Number,
      default: 10
    },
  },
  setup(props) {
    const { $klicker, route } = useContext()

    const columns = computed(() => {
      return [<Column>{
        title: props.dimensions.map(d => $klicker.getName(d)).join(', '),
        keys: props.dimensions.map(d => `dimensions.${d.id}`),
        // dimensions are rendered n:m
        slot: 'dimensions',
      }].concat(
        props.measurements.map(m => (<Column>{
          // measurements are rendered 1:1
          title: $klicker.getName(m),
          keys: [`measurements.${m.id}`],
          slot: `measurements.${m.id}`,
          shrink: true,
        })),
      )
    })

    const link = computed(() => (<Location>{
      ...$klicker.stateToLocation(props.state),
      path: '/dashboard',
    }))

    const showLink = computed(() => route.value.path != '/dashboard')

    return {
      columns,
      link,
      showLink,
      faExternalLinkAlt,
    }
  },
})
</script>
