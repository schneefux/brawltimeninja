<template>
  <div class="contents">
    <b-dashboard-cell
      v-for="t in templates"
      :key="t.title"
      :columns="4"
      :rows="2"
      hide-empty
      lazy
    >
      <c-query
        :query="t.query"
        :filter="filter"
      >
        <template v-slot="data">
          <v-roll
            v-bind="data"
            :card="{ title: t.title, elevation: elevation, titleLink: t.link }"
          ></v-roll>
        </template>
      </c-query>
    </b-dashboard-cell>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from 'vue'
import useTopNTitle from '~/composables/top-n-title'
import { SliceValue, CubeComparingQuery, CubeQuery, CubeComparingQueryFilter } from '@schneefux/klicker/types'
import { VRoll, BShimmer, CQuery, BButton, BDashboardCell } from '@schneefux/klicker/components'
import { camelToKebab } from '~/lib/util'
import { getMapName } from '~/composables/map'
import { useContext } from '~/composables/compat'

interface Template {
  tab: string
  title: string
  link: string
  linkText: string
  query: (CubeQuery|CubeComparingQuery)
  long?: boolean
}

export default defineComponent({
  components: {
    BDashboardCell,
    VRoll,
    BShimmer,
    CQuery,
    BButton,
  },
  props: {
    slices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
    id: {
      type: [Number, String],
      default: () => undefined
    },
    elevation: {
      type: Number,
      default: 1
    },
    tab: {
      type: String,
      required: true
    },
  },
  setup(props) {
    const { i18n } = useContext()

    const { id, slices } = toRefs(props)
    const title = useTopNTitle('map.insights.title', slices, id)

    const limit = 4

    const templates = computed<Template[]>(() => {
      const templates: Template[] = []

      if (props.slices.map == undefined || props.slices.map[0] == undefined) {
        return []
      }

      const mode = props.slices.mode[0] as string
      const title = i18n.t('map.insights.compare-to.mode', { mode: i18n.t('mode.' + mode) })
      const testName = getMapName(props.id, props.slices.map[0])
      const referenceName = i18n.t('mode.' + mode)

      templates.push({
        tab: 'brawlers',
        title,
        link: `/tier-list/mode/${camelToKebab(mode)}`,
        linkText: i18n.t('action.open.tier-list.mode', { mode: i18n.t('mode.' + mode) }),
        query: <CubeComparingQuery>{
          name: testName,
          comparing: true,
          cubeId: 'map',
          sortId: 'pvalue',
          dimensionsIds: ['brawler'],
          metricsIds: ['winRate'],
          slices: props.slices,
          reference: {
            name: referenceName,
            cubeId: 'map',
            dimensionsIds: ['brawler'],
            metricsIds: ['winRate'],
            slices: {
              ...props.slices,
              map: [],
            },
            sortId: 'pvalue',
          },
          limit,
        },
      })

      templates.push({
        tab: 'gadgets',
        title,
        link: `/tier-list/gadgets`,
        linkText: i18n.t('action.open.tier-list.gadget'),
        query: <CubeComparingQuery>{
          name: testName,
          comparing: true,
          cubeId: 'battle',
          sortId: 'pvalue',
          dimensionsIds: ['brawler', 'gadget'],
          metricsIds: ['winRate'],
          slices: {
            ...props.slices,
            gadgetIdNeq: ['0'],
          },
          reference: {
            name: referenceName,
            cubeId: 'battle',
            dimensionsIds: ['brawler'],
            metricsIds: ['winRate'],
            slices: {
              ...props.slices,
              gadgetIdNeq: ['0'],
              map: [],
            },
            sortId: 'pvalue',
          },
          limit,
        },
      })

      templates.push({
        tab: 'starpowers',
        title,
        link: `/tier-list/starpowers`,
        linkText: i18n.t('action.open.tier-list.starpower'),
        query: <CubeComparingQuery>{
          name: testName,
          comparing: true,
          cubeId: 'battle',
          sortId: 'pvalue',
          dimensionsIds: ['brawler', 'starpower'],
          metricsIds: ['winRate'],
          slices: {
            ...props.slices,
            starpowerIdNeq: ['0'],
          },
          reference: {
            name: referenceName,
            cubeId: 'battle',
            dimensionsIds: ['brawler', 'starpower'],
            metricsIds: ['winRate'],
            slices: {
              ...props.slices,
              starpowerIdNeq: ['0'],
              map: [],
            },
            sortId: 'pvalue',
          },
          limit,
        },
      })

      templates.push({
        tab: 'gears',
        title,
        link: `/tier-list/gears`,
        linkText: i18n.t('action.open.tier-list.gear'),
        long: true,
        query: <CubeComparingQuery>{
          name: testName,
          comparing: true,
          cubeId: 'battle',
          sortId: 'pvalue',
          dimensionsIds: ['gear'],
          metricsIds: ['winRate'],
          slices: {
            ...props.slices,
            gearIdNeq: ['0'],
          },
          reference: {
            name: referenceName,
            cubeId: 'battle',
            dimensionsIds: ['gear'],
            metricsIds: ['winRate'],
            slices: {
              ...props.slices,
              gearIdNeq: ['0'],
              map: [],
            },
            sortId: 'pvalue',
          },
          limit,
        },
      })

      return templates.filter(t => t.tab == props.tab)
    })

    const filter: CubeComparingQueryFilter = (e) => e.test.difference.pValueRaw <= 0.05

    return {
      title,
      filter,
      templates,
    }
  },
})
</script>
