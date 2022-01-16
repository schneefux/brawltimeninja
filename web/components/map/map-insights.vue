<template>
  <div class="contents">
    <div
      v-for="t in templates"
      :key="t.title"
      class="dashboard-cell var--rows-1 md:var--rows-2"
      style="--columns: 3;"
    >
      <b-card
        :title="t.title"
        :elevation="elevation + 1"
        class="h-full"
        full-height
      >
        <b-button
          v-if="t.link"
          slot="actions"
          :to="t.link"
          primary
          sm
        >
          {{ t.linkText }}
        </b-button>

        <c-query
          slot="content"
          :query="t.query"
          :filter="filter"
        >
          <b-shimmer
            slot="placeholder"
            width-px="224"
            height-px="64"
            loading
          ></b-shimmer>
          <p slot="empty" class="text-center">
            {{ $t('state.no-data') }}
          </p>
          <template v-slot="data">
            <v-roll
              v-bind="{
                ...data,
                elevation: elevation + 2,
                long: t.long,
              }"
            >
              <template v-slot:dimensions="data">
                <d-brawler v-bind="data"></d-brawler>
              </template>
            </v-roll>
          </template>
        </c-query>
      </b-card>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs, useContext } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'
import { SliceValue, CubeComparingQuery, CubeQuery, CubeComparingQueryFilter } from '~/klicker'
import { VRoll, BShimmer, CQuery, BButton } from '~/klicker/components'
import { camelToKebab } from '~/lib/util'

interface Template {
  title: string
  link?: string
  linkText: string
  query: (CubeQuery|CubeComparingQuery)
  long?: boolean
}

export default defineComponent({
  components: {
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
  },
  setup(props) {
    const { i18n, localePath } = useContext()

    const { id, slices } = toRefs(props)
    const title = useTopNTitle('map.insights.title', slices, id)

    const limit = 5

    const templates = computed<Template[]>(() => {
      const templates: Template[] = []

      if (props.slices.map != undefined && props.slices.map[0] != undefined) {
        const mode = props.slices.mode[0] as string
        templates.push({
          title: i18n.t('map.insights.compare-to.mode', { mode: i18n.t('mode.' + mode) }) as string,
          link: localePath(`/tier-list/mode/${camelToKebab(mode)}`),
          linkText: i18n.t('action.open.tier-list.mode', { mode: i18n.t('mode.' + mode) }) as string,
          query: <CubeComparingQuery>{
            comparing: true,
            cubeId: 'map',
            sortId: 'pvalue',
            dimensionsIds: ['brawler'],
            measurementsIds: ['winRate'],
            slices: props.slices,
            reference: {
              cubeId: 'map',
              dimensionsIds: ['brawler'],
              measurementsIds: ['winRate'],
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
        title: i18n.t('map.insights.outstanding.gadgets') as string,
        link: localePath(`/tier-list/gadgets`),
        linkText: i18n.t('action.open.tier-list.gadget') as string,
        query: <CubeComparingQuery>{
          comparing: true,
          cubeId: 'battle',
          sortId: 'pvalue',
          dimensionsIds: ['brawler', 'gadget'],
          measurementsIds: ['winRate'],
          slices: {
            ...props.slices,
            gadgetIdNeq: ['0'],
          },
          reference: {
            cubeId: 'battle',
            dimensionsIds: ['brawler'],
            measurementsIds: ['winRate'],
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
        title: i18n.t('map.insights.outstanding.starpowers') as string,
        link: localePath(`/tier-list/starpowers`),
        linkText: i18n.t('action.open.tier-list.starpower') as string,
        query: <CubeComparingQuery>{
          comparing: true,
          cubeId: 'battle',
          sortId: 'pvalue',
          dimensionsIds: ['brawler', 'starpower'],
          measurementsIds: ['winRate'],
          slices: {
            ...props.slices,
            starpowerIdNeq: ['0'],
          },
          reference: {
            cubeId: 'battle',
            dimensionsIds: ['brawler'],
            measurementsIds: ['winRate'],
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
        title: i18n.t('map.insights.outstanding.gears') as string,
        // link: localePath(`/tier-list/gears`),
        linkText: i18n.t('action.open.tier-list.gear') as string,
        long: true,
        query: <CubeComparingQuery>{
          comparing: true,
          cubeId: 'battle',
          sortId: 'pvalue',
          dimensionsIds: ['gear'],
          measurementsIds: ['winRate'],
          slices: {
            ...props.slices,
            gearIdNeq: ['0'],
          },
          reference: {
            cubeId: 'battle',
            dimensionsIds: [],
            measurementsIds: ['winRate'],
            slices: {
              ...props.slices,
              gearIdEq: ['0'],
            },
            sortId: 'pvalue',
          },
          limit,
        },
      })

      return templates
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
