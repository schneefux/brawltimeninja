<template>
  <c-query :query="query">
    <template v-slot="data">
      <v-line-plot
        :title="title"
        v-bind="data"
        full-height
      ></v-line-plot>
    </template>
  </c-query>
</template>

<script lang="ts">
import { CQuery, VLinePlot } from '~/klicker/components'
import { SliceValue, CubeComparingQuery, CubeQuery } from '~/klicker'
import { computed, defineComponent, PropType, toRefs, useContext } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'
import { capitalizeWords, getSeasonEnd } from '~/lib/util'

export default defineComponent({
  components: {
    CQuery,
    VLinePlot,
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
    metric: {
      type: String,
      default: 'winRate'
      // TODO add support for useRate - show use rate trends on brawler page
    },
    dimension: {
      type: String,
      default: 'day'
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
        name = i18n.t('mode.' + props.slices.mode[0]!) as string + ' - ' + i18n.t('map.' + props.id) as string
        referenceName = i18n.t('mode.' + props.slices.mode[0]!) as string
        comparingSlices = {
          ...props.slices,
          map: [],
        }
      }
      if (comparingSlices == undefined && props.slices.mode?.length > 0) {
        name = i18n.t('mode.' + props.slices.mode[0]) as string
        referenceName = i18n.t('option.all-modes') as string
        comparingSlices = {
          ...props.slices,
          mode: [],
        }
      }
      if (comparingSlices == undefined && props.slices.brawler?.length > 0) {
        name = capitalizeWords(props.slices.brawler[0]!.toLowerCase())
        referenceName = i18n.t('option.all-brawlers') as string
        comparingSlices = {
          ...props.slices,
          brawler: [],
        }
      }

      const oneMonthAgo = new Date()
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 4*7)
      const season = getSeasonEnd(oneMonthAgo).toISOString().slice(0, 10)

      return <CubeQuery|CubeComparingQuery>{
        name,
        cubeId: 'battle',
        dimensionsIds: [props.dimension],
        measurementsIds: [props.metric],
        slices: {
          ...props.slices,
          season: [season],
        },
        sortId: 'day',
        confidenceInterval: true,
        ...(comparingSlices != undefined ? {
          comparing: true,
          reference: {
            name: referenceName,
            cubeId: 'battle',
            dimensionsIds: [props.dimension],
            measurementsIds: [props.metric],
            slices: {
              ...comparingSlices,
              season: [season],
            },
            sortId: 'day',
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
