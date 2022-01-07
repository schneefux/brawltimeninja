<template>
  <b-card
    :title="title"
    :elevation="elevation"
    full-height
  >
    <div slot="content">
      <p class="mb-2">{{ $t('map.insights.description') }}</p>
      <div class="flex flex-wrap">
        <b-card
          v-for="t in templates"
          :key="t.title"
          :title="t.title"
          :elevation="elevation + 1"
          class="flex-auto"
          full-height
        >
          <b-button
            slot="actions"
            :to="t.link"
            primary
            sm
          >
            {{ t.linkText }}
          </b-button>

          <div slot="content">
            <div
              v-for="(q, index) in t.queries"
              :key="index"
            >
              <c-query
                slot="content"
                :query="q"
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
                    }"
                  >
                    <template v-slot:dimensions="data">
                      <d-brawler v-bind="data"></d-brawler>
                    </template>
                  </v-roll>
                </template>
              </c-query>
            </div>
          </div>
        </b-card>
      </div>
    </div>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs, useContext } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'
import { SliceValue, CubeComparingQuery, CubeQuery, CubeComparingQueryFilter } from '~/klicker'
import { VRoll, BShimmer, CQuery, BButton } from '~/klicker/components'
import { camelToKebab } from '~/lib/util'

interface Template {
  title: string
  link: string
  linkText: string
  queries: (CubeQuery|CubeComparingQuery)[]
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

    const limit = 4

    const templates = computed<Template[]>(() => {
      const templates: Template[] = []

      if (props.slices.map != undefined && props.slices.map[0] != undefined) {
        const mode = props.slices.mode[0] as string
        templates.push({
          title: i18n.t('map.insights.compare-to.mode', { mode: i18n.t('mode.' + mode) }) as string,
          link: localePath(`/tier-list/mode/${camelToKebab(mode)}`),
          linkText: i18n.t('action.open.tier-list.mode', { mode: i18n.t('mode.' + mode) }) as string,
          queries: [<CubeComparingQuery>{
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
          }],
        })
      }

      templates.push({
        title: i18n.t('map.insights.outstanding.gadgets') as string,
        link: localePath(`/tier-list/gadgets`),
        linkText: i18n.t('action.open.tier-list.gadget') as string,
        queries: [<CubeComparingQuery>{
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
        }],
      })

      templates.push({
        title: i18n.t('map.insights.outstanding.starpowers') as string,
        link: localePath(`/tier-list/starpowers`),
        linkText: i18n.t('action.open.tier-list.starpower') as string,
        queries: [<CubeComparingQuery>{
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
        }],
      })

      templates.push({
        title: i18n.t('map.insights.outstanding.gears') as string,
        link: localePath(`/tier-list/gears`),
        linkText: i18n.t('action.open.tier-list.gear') as string,
        queries: [<CubeComparingQuery>{
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
        }],
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
