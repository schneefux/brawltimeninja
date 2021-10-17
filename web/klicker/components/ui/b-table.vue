<template>
  <div>
    <table class="mx-auto">
      <thead>
        <tr class="h-8 border-b border-gray-600">
          <th
            v-if="ranked"
            scope="col"
            class="text-right pr-2 w-0"
          >
            #
          </th>
          <th
            v-for="(c, index) in columns"
            :key="c.keys.join('-')"
            :class="['text-left', {
              'pr-1': index != columns.length - 1,
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
            {{ $t('state.no-data') }}
          </td>
        </tr>
        <tr
          v-for="r in pageRows"
          :key="r.key"
        >
          <td
            v-if="ranked"
            scope="row"
            class="text-right pr-2 pt-1"
          >
            {{ r.index + 1 }}
          </td>
          <td
            v-for="c in renderedColumns"
            :key="c.keys.join('-')"
            :class="['text-left pt-1', {
              'pr-1': c.index != columns.length - 1,
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
      v-if="pageSize != undefined"
      v-model="page"
      :pages="Math.ceil(rows.length / pageSize) - 1"
      class="pt-2 pb-1 mt-auto"
    ></b-paginator>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from '@nuxtjs/composition-api'
import BPaginator from '~/klicker/components/ui/b-paginator.vue'

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
      type: Number
    },
    ranked: {
      type: Boolean
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

    return {
      page,
      pageRows,
      renderedColumns,
    }
  },
})
</script>
