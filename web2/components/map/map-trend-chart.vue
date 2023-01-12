<template>
  <c-query
    :query="query"
    :filter="filter"
  >
    <template v-slot="data">
      <v-lineplot
        v-bind="data"
        :card="{ title }"
      ></v-lineplot>
    </template>
  </c-query>
</template>

<script lang="ts">
import { CQuery, VLineplot } from '@schneefux/klicker/components'
import { SliceValue, CubeComparingQuery, CubeQuery, CubeComparingQueryFilter } from '@schneefux/klicker/types'
import { computed, defineComponent, PropType, toRefs } from 'vue'
import { useContext } from '~/composables/compat'
import useTopNTitle from '~/composables/top-n-title'
import { capitalizeWords, formatClickhouseDate, getSeasonEnd } from '~/lib/util'

export default defineComponent({
  components: {
    CQuery,
    VLineplot,
  },
  props: {
    id: {
      type: [Number, String],
      default: () => undefined
    },
    slices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
    cubeId: {
      type: String,
      default: 'battle'
    },
    metric: {
      type: String,
      default: 'winRate'
    },
    dimensions: {
      type: Array as PropType<string[]>,
      default: () => ['day']
    },
    sort: {
      type: String,
      default: 'day'
    },
    filter: {
      type: Function as PropType<CubeComparingQueryFilter>,
      required: false
    },
    noCompare: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const { i18n } = useContext()

    const query = computed(() => {
      let comparingSlices: SliceValue|undefined = undefined
      let name: string|undefined
      let referenceName: string|undefined

      // TODO refactor: write a function that returns a query that compares to parent dimension
      if (comparingSlices == undefined && props.slices.map?.length > 0) {
        name = i18n.t('mode.' + props.slices.mode[0]!) + ' - ' + i18n.t('map.' + props.id)
        referenceName = i18n.t('mode.' + props.slices.mode[0]!)
        comparingSlices = {
          ...props.slices,
          map: [],
        }
      }
      if (comparingSlices == undefined && props.slices.mode?.length > 0) {
        name = i18n.t('mode.' + props.slices.mode[0])
        referenceName = i18n.t('option.all-modes')
        comparingSlices = {
          ...props.slices,
          mode: [],
        }
      }
      if (comparingSlices == undefined && props.slices.brawler?.length > 0) {
        name = capitalizeWords(props.slices.brawler[0]!.toLowerCase())
        referenceName = i18n.t('option.all-brawlers')
        comparingSlices = {
          ...props.slices,
          brawler: [],
        }
      }

      const oneMonthAgo = new Date()
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 4*7)
      const season = formatClickhouseDate(getSeasonEnd(oneMonthAgo))

      const query: CubeQuery = {
        name,
        cubeId: props.cubeId,
        dimensionsIds: props.dimensions,
        metricsIds: [props.metric],
        slices: {
          ...props.slices,
          season: [season],
        },
        sortId: props.sort,
        confidenceInterval: true,
      }

      if (props.noCompare) {
        return query
      }

      return <CubeComparingQuery>{
        ...query,
        ...(comparingSlices != undefined ? {
          comparing: true,
          reference: {
            name: referenceName,
            cubeId: props.cubeId,
            dimensionsIds: props.dimensions,
            metricsIds: [props.metric],
            slices: {
              ...comparingSlices,
              season: [season],
            },
            sortId: props.sort,
            confidenceInterval: true,
          },
        } : {})
      }
    })

    const { id, slices } = toRefs(props)
    const args = computed(() => ({
      metric: i18n.t('metric.' + props.metric),
    }))
    const title = useTopNTitle('trend-chart.metric', slices, id, args)

    return {
      title,
      query,
    }
  },
})
</script>
