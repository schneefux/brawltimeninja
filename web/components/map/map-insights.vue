<template>
  <b-card
    :title="title"
    :elevation="elevation"
    v-bind="$attrs"
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
          <div slot="content">
            <div
              v-for="(q, index) in t.queries"
              :key="index"
            >
              <c-query
                slot="content"
                :query="q"
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
import { SliceValue, CubeComparingQuery, CubeQuery } from '~/klicker'
import { VRoll, BShimmer, CQuery, BButton } from '~/klicker/components'

interface Template {
  title: string
  queries: (CubeQuery|CubeComparingQuery)[]
}

export default defineComponent({
  components: {
    VRoll,
    BShimmer,
    CQuery,
    BButton,
  },
  inheritAttrs: false,
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
    const { i18n } = useContext()

    const { id, slices } = toRefs(props)
    const title = useTopNTitle('map.insights.title', slices, id)

    const limit = 4

    const templates = computed<Template[]>(() => {
      const templates: Template[] = []

      if (props.slices.map != undefined && props.slices.map[0] != undefined) {
        templates.push({
          title: i18n.t('map.insights.compare-to.mode', { mode: i18n.t('mode.' + props.slices.mode[0]) }) as string,
          queries: [<CubeComparingQuery>{
            comparing: true,
            cubeId: 'battle',
            sortId: 'pvalue',
            dimensionsIds: ['brawler'],
            measurementsIds: ['winRate'],
            slices: props.slices,
            reference: {
              cubeId: 'battle',
              dimensionsIds: ['brawler'],
              measurementsIds: ['winRate'],
              slices: {
                ...props.slices,
                map: [],
              },
              sortId: 'pvalue',
            },
            significant: true,
            limit,
          }],
        })
      }

      templates.push({
        title: i18n.t('map.insights.outstanding.gadgets') as string,
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
          significant: true,
          limit,
        }],
      })

      templates.push({
        title: i18n.t('map.insights.outstanding.starpowers') as string,
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
          significant: true,
          limit,
        }],
      })

      return templates
    })

    return {
      templates,
      title,
    }
  },
})
</script>
