<template>
  <component
    :is="vwrapper.is"
    v-bind="vwrapper.props"
  >
    <template v-slot:content>
      <div
        ref="wrapper"
        class="h-full w-full overflow-x-auto scrollbar:hidden flex flex-col"
      >
        <table class="flex-auto w-full border-separate border-spacing-0">
          <tbody>
            <tr>
              <th
                scope="row"
                ref="heading"
                class="font-normal text-sm text-left pt-2 pb-1 pr-3 border-r border-gray-600 whitespace-nowrap w-0"
              >{{ dimensionName }}</th>
              <d-auto
                v-for="title in headings.slice(page * pageSize, (page + 1) * pageSize)"
                :key="title.id"
                :ref="el => setItemRef(title.id, (el as any)?.$el)"
                :response="response"
                :row="title.entry"
                tag="td"
                class="text-center pt-2 pb-1 pl-3"
              ></d-auto>
            </tr>

            <tr
              v-for="row in body"
              :key="row.id"
            >
              <th
                scope="row"
                class="font-normal text-sm text-left pt-1 pr-3 border-r border-gray-600 whitespace-nowrap text-text/75"
              >{{ row.title }}</th>
              <td
                v-for="column in row.columns.slice(page * pageSize, (page + 1) * pageSize)"
                :key="column.id"
                class="text-center pt-1 pl-3 text-text"
              >
                <m-auto
                  :response="response"
                  :row="column.entry"
                  :metric-id="row.metricId"
                ></m-auto>
              </td>
            </tr>
          </tbody>
        </table>

        <b-paginator
          v-if="pageSize != undefined && headings.length > pageSize"
          v-model="page"
          :pages="Math.ceil(headings.length / pageSize)"
          class="pt-4 mt-auto mx-auto"
        ></b-paginator>
      </div>
    </template>
  </component>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, nextTick, useTemplateRef, toRef } from 'vue'
import { VisualisationProps } from '../../props'
import { useCubeResponseProps } from '../../composables/response'
import BPaginator from '../ui/b-paginator.vue'
import DAuto from './d-auto.vue'
import MAuto from './m-auto.vue'
import { useResizeObserver } from '@vueuse/core'
import { useKlickerConfig } from '../../composables/klicker'
import { useVWrapper, vwrappers } from '../../composables/vwrapper'

/**
 * Table visualisation that renders rows on the X axis
 */
export default defineComponent({
  name: 'VRoll',
  components: {
    BPaginator,
    DAuto,
    MAuto,
    ...vwrappers,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { translate } = useKlickerConfig()
    const { $klicker, dimensions, metrics, switchResponse } = useCubeResponseProps(props)

    const dimension = computed(() => dimensions.value[0])
    const dimensionName = computed(() => $klicker.getName(translate, dimension.value, 'short'))
    const headings = computed(() =>
      switchResponse(
        response => response.data.map(e => ({
          id: e.id,
          entry: e,
        })),
        response => response.data.map(e => ({
          id: e.id,
          entry: e,
        }))
      )
    )

    const body = computed(() =>
      switchResponse(
        response => metrics.value.map((metric) => ({
          id: metric.id,
          metricId: metric.id,
          title: $klicker.getName(translate, metric, 'short'),
          columns: response.data.map(e => ({
            id: `${metric.id}-${e.id}`,
            entry: e,
          }))
        })),
        response => metrics.value.flatMap(metric => [{
          id: metric.id,
          metricId: metric.id,
          title: (response.query.name ?? translate('comparison.dataset.test')) + ' ' + $klicker.getName(translate, metric),
          columns: response.data.map(e => ({
            id: `${metric.id}-${e.id}`,
            entry: e,
          })),
        }, {
          id: `${metric.id}-reference`,
          metricId: metric.id,
          title: (response.query.reference.name ?? translate('comparison.dataset.reference')) + ' ' + $klicker.getName(translate, metric),
          columns: response.data.map(e => ({
            id: `${metric.id}-${e.id}-reference`,
            entry: e.test.reference,
          })),
        }])
      )
    )

    const wrapperRef = useTemplateRef<HTMLElement>('wrapper')
    const headingRef = useTemplateRef<HTMLElement>('heading')
    const itemRefs = ref<Record<string, HTMLElement|null>>({})
    const setItemRef = (id: string, el: HTMLElement|null) => itemRefs.value[id] = el
    const page = ref(0)
    const pageSize = ref(headings.value.length)

    const calculatePageSize = () => {
      if (wrapperRef.value == undefined || headingRef.value == undefined) {
        return pageSize.value
      }

      const firstItemElement = Object.values(itemRefs.value)
        .find(v => v != undefined)

      if (firstItemElement == undefined) {
        return pageSize.value
      }

      // Safari's float widths cause some rounding errors, so do some generous rounding

      const pxPerItem = Math.floor(firstItemElement.getBoundingClientRect().width)

      const pxForHeader = Math.floor(headingRef.value.getBoundingClientRect().width)

      const pxWholeWidth = Math.ceil(wrapperRef.value.getBoundingClientRect().width)
      const pxAvailableForItems = pxWholeWidth - pxForHeader

      return Math.min(Math.max(Math.floor(pxAvailableForItems / pxPerItem), 1), headings.value.length)
    }

    const pxPreviousWidth = ref(0)
    const updatePageSize = () => {
      // td fills the remaining space
      // in order to grow, re-render the full list and determine the size in the next tick
      pageSize.value = headings.value.length
      nextTick(() => pageSize.value = calculatePageSize())
    }

    useResizeObserver(wrapperRef, ([ entry ]) => window.requestAnimationFrame(() => {
      if (wrapperRef.value == undefined) {
        return
      }

      const pxWholeWidth = entry.contentRect.width
      if (pxWholeWidth == pxPreviousWidth.value) {
        // wrapper width is same, skip update
        return
      }

      pxPreviousWidth.value = pxWholeWidth

      updatePageSize()
    }))

    const previousItemsLength = ref(body.value.length)
    watch(() => body.value, () => {
      if (body.value.length == previousItemsLength.value) {
        return
      }

      previousItemsLength.value = body.value.length
      updatePageSize()
    })

    const vwrapper = useVWrapper(toRef(props, 'card'), toRef(props, 'loading'))

    // TODO assumes d-auto / m-auto do not change - might want to add a mutation observer

    return {
      vwrapper,
      page,
      pageSize,
      headings,
      body,
      dimensionName,
      setItemRef,
    }
  },
})
</script>
