<template>
  <div class="flex flex-col">
    <table class="w-full">
      <thead class="text-sm">
        <tr class="h-8 border-b border-gray-600">
          <th
            v-if="ranked"
            scope="col"
            class="text-right pr-3 w-0 font-normal"
          >
            #
          </th>
          <th
            v-for="(c, index) in columns"
            :key="c.keys.join('-')"
            :class="['text-left leading-tight pb-2 font-normal', {
              'pr-3': index != columns.length - 1,
              'w-0': c.shrink,
            }]"
            scope="col"
          >
            {{ c.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="pageRows.length == 0">
          <td
            :colspan="(ranked ? 1 : 0) + columns.length"
            class="text-center overflow-auto"
          >
            {{ translate('state.no-data') }}
          </td>
        </tr>
        <tr
          v-for="r in pageRows"
          :key="r.key"
        >
          <td
            v-if="ranked"
            scope="row"
            class="text-right pr-3 pt-2"
          >
            {{ r.index + 1 }}
          </td>
          <td
            v-for="c in renderedColumns"
            :key="c.keys.join('-')"
            :class="['text-left pt-2', {
              'pr-3': c.index != columns.length - 1,
            }]"
          >
            <slot
              :name="c.slot"
              :row="r.row"
            >
              {{ r.fields[c.index] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <b-paginator
      v-if="!noPaginator && pageSize != undefined"
      v-model="page"
      :pages="Math.ceil(rows.length / pageSize) - 1"
      class="pt-4 mt-auto"
    ></b-paginator>
  </div>
</template>

<script lang="ts">
import { useKlicker } from '../../composables/klicker'
import { computed, defineComponent, PropType, ref, watch } from 'vue-demi'
import BPaginator from './b-paginator.vue'

export interface Column {
  /** column title */
  title: string
  /** dot-path to property rendered in cell per default */
  keys: string[]
  /** cell slot to use instead. the slot receives a "row" prop. */
  slot?: string
  /** if true, set width to minimal content width */
  shrink?: boolean
}

interface IndexedColumn extends Column {
  index: number
}

export default defineComponent({
  components: {
    BPaginator,
  },
  props: {
    columns: {
      type: Array as PropType<Column[]>,
      required: true
    },
    idKey: {
      type: String,
      required: true
    },
    rows: {
      type: Array as PropType<object[]>,
      required: true
    },
    pageSize: {
      type: Number,
      required: false
    },
    ranked: {
      type: Boolean,
      default: false
    },
    noPaginator: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const page = ref(0)

    const pageRows = computed(() => {
      const offset = page.value * (props.pageSize || 0)
      const pageRows = props.pageSize == undefined ? props.rows : props.rows.slice(offset, (page.value+1)*props.pageSize)
      return pageRows.map((r, index) => ({
        key: r[props.idKey],
        index: offset + index,
        row: r,
        fields: props.columns.map(c => c.keys.map(k => k.split('.').reduce((a, b) => a[b], r)).join(', ')),
      })) as object[]
    })

    const renderedColumns = computed(() => props.columns
      .map((c, index) => (<IndexedColumn>{
        ...c,
        index,
      })))

    watch(
      () => props.columns,
      () => page.value = 0
    )
    watch(
      () => props.rows,
      () => page.value = 0
    )

    const { $klicker } = useKlicker()
    const translate = (key: string, args?: any) => $klicker.$t(key, args)

    return {
      translate,
      page,
      pageRows,
      renderedColumns,
    }
  },
})
</script>
