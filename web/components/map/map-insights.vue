<template>
  <div class="contents">
    <c-dashboard-cell
      v-for="t in templates"
      :key="t.title"
      :columns="4"
      :rows="2"
      hide-empty
    >
      <c-query
        :query="t.query"
        :filter="filter"
      >
        <template v-slot="data">
          <v-roll
            v-bind="data"
            :card="{ title: t.title, elevation: elevation, titleLink: t.link, fullHeight: true }"
          >
            <template v-slot:dimensions="data">
              <d-brawler v-bind="data"></d-brawler>
              <d-gear v-bind="data"></d-gear>
            </template>
          </v-roll>
        </template>
      </c-query>
    </c-dashboard-cell>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs, useContext } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'
import { SliceValue, CubeComparingQuery, CubeQuery, CubeComparingQueryFilter } from '@schneefux/klicker/types'
import { VRoll, BShimmer, CQuery, BButton, CDashboardCell } from '@schneefux/klicker/components'
import { camelToKebab } from '~/lib/util'

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
    CDashboardCell,
    VRoll,
    BShimmer,
    CQuery,
    BButton,
  },
  props: {
    slices: {
      type: Object as PropType<SliceValue>,
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
    const { i18n, localePath } = useContext()

    const { id, slices } = toRefs(props)
    const title = useTopNTitle('map.insights.title', slices, id)

    const limit = 4

    const templates = computed<Template[]>(() => {
      const templates: Template[] = []

      if (props.slices.map != undefined && props.slices.map[0] != undefined) {
        const mode = props.slices.mode[0] as string
        templates.push({
          tab: 'brawlers',
          title: i18n.t('map.insights.compare-to.mode', { mode: i18n.t('mode.' + mode) }) as string,
          link: localePath(`/tier-list/mode/${camelToKebab(mode)}`),
          linkText: i18n.t('action.open.tier-list.mode', { mode: i18n.t('mode.' + mode) }) as string,
          query: <CubeComparingQuery>{
            comparing: true,
            cubeId: 'map',
            sortId: 'pvalue',
            dimensionsIds: ['brawler'],
            metricsIds: ['winRate'],
            slices: props.slices,
            reference: {
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
      }

      templates.push({
        tab: 'gadgets',
        title: i18n.t('map.insights.outstanding.gadgets') as string,
        link: localePath(`/tier-list/gadgets`),
        linkText: i18n.t('action.open.tier-list.gadget') as string,
        query: <CubeComparingQuery>{
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
            cubeId: 'battle',
            dimensionsIds: ['brawler'],
            metricsIds: ['winRate'],
            slices: {
              ...props.slices,
              gadgetIdEq: ['0'],
            },
            sortId: 'pvalue',
          },
          limit,
        },
      })

      templates.push({
        tab: 'starpowers',
        title: i18n.t('map.insights.outstanding.starpowers') as string,
        link: localePath(`/tier-list/starpowers`),
        linkText: i18n.t('action.open.tier-list.starpower') as string,
        query: <CubeComparingQuery>{
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
            cubeId: 'battle',
            dimensionsIds: ['brawler'],
            metricsIds: ['winRate'],
            slices: {
              ...props.slices,
              starpowerIdEq: ['0'],
            },
            sortId: 'pvalue',
          },
          limit,
        },
      })

      templates.push({
        tab: 'gears',
        title: i18n.t('map.insights.outstanding.gears') as string,
        link: localePath(`/tier-list/gears`),
        linkText: i18n.t('action.open.tier-list.gear') as string,
        long: true,
        query: <CubeComparingQuery>{
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
            cubeId: 'battle',
            dimensionsIds: [],
            metricsIds: ['winRate'],
            slices: {
              ...props.slices,
              gearIdEq: ['0'],
            },
            sortId: 'pvalue',
          },
          limit: 3,
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
