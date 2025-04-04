<template>
  <div class="flex flex-col">
    <table class="w-full">
      <thead>
        <tr class="h-8 border-b border-gray-600">
          <th
            v-if="ranked"
            scope="col"
            class="text-right pb-2 pr-3 w-0 font-normal"
          >
            #
          </th>
          <th
            v-for="(c, index) in columns"
            :key="`head-${c.keys.join('-')}`"
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
          :key="`row-${r.id}`"
        >
          <td
            v-if="ranked"
            class="text-right pr-3 pt-2"
          >
            {{ r.index + 1 }}
          </td>
          <component
            v-for="c in renderedColumns"
            :is="c.header ? 'th' : 'td'"
            :scope="c.header ? 'row' : undefined"
            :key="`cell-${r.id}-${c.keys.join('-')}-${r.fieldHashes[c.index]}`"
            :class="['text-left pt-2', {
              'pr-3': c.index != columns.length - 1,
              'text-text': c.lightText,
              'text-text/75': !c.lightText,
            }]"
          >
            <slot
              :name="c.slot"
              :row="r.row"
            >
              {{ r.fields[c.index] }}
            </slot>
          </component>
        </tr>
      </tbody>
    </table>

    <b-paginator
      v-if="!noPaginator && pageSize != undefined && rows.length > pageSize"
      v-model="page"
      :pages="Math.ceil(rows.length / pageSize)"
      class="pt-4 mt-auto mx-auto"
    ></b-paginator>
  </div>
</template>

<script lang="ts">
import { useKlickerConfig } from '../../composables/klicker'
import { computed, defineComponent, PropType, ref, watch } from 'vue'
import { hashCode } from '../../util'
import BPaginator from './b-paginator.vue'

export interface Column {
  /**
   * Column title
   */
  title: string
  /**
   * Dot-path to the properties that are rendered in the cell by default
   */
  keys: string[]
  /**
   * Name of the slot that should render this cell
   *
   * The slot receives a "row" prop with the full data row.
   */
  slot?: string
  /**
   * If true, set width to minimal content width
   */
  shrink?: boolean
  /**
   * If true, apply lighter font color
   */
  lightText?: boolean
  /**
   * If true, render as row-scoped th
   */
  header?: boolean
}

export interface IndexedColumn extends Column {
  index: number
}

/**
 * Render a table
 */
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
      return pageRows.map((r, index) => {
        const fieldValues = props.columns.map(c => c.keys.map(k => k.split('.').reduce((a, b) => a[b as keyof typeof a], r)).join(', '))
        return {
          id: r[props.idKey as keyof typeof r],
          index: offset + index,
          row: r,
          fields: fieldValues,
          fieldHashes: fieldValues.map(v => hashCode(JSON.stringify(v))),
        }
      })
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

    const { translate } = useKlickerConfig()

    return {
      translate,
      page,
      pageRows,
      renderedColumns,
    }
  },
})
</script>
