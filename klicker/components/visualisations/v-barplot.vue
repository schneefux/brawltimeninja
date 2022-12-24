<template>
  <v-card-wrapper
    v-bind="$props"
    component="v-barplot"
  >
    <template v-slot:content>
      <div
        ref="wrapper"
        class="h-full w-full flex flex-col"
      >
        <b-vega
          :spec="spec"
          :show-download="card != undefined"
          full-width
          full-height
        ></b-vega>

        <b-paginator
          v-if="pageSize != undefined && values.length > pageSize"
          v-model="page"
          :pages="Math.ceil(values.length / pageSize)"
          class="pt-4 mt-auto mx-auto"
        ></b-paginator>
      </div>
    </template>
  </v-card-wrapper>
</template>

<script lang="ts">
import { VisualisationProps } from '../../props'
import { VisualizationSpec } from 'vega-embed'
import BVega from '../ui/b-vega.vue'
import BPaginator from '../ui/b-paginator.vue'
import { computed, defineComponent, ref } from 'vue'
import { useCubeResponseProps } from '../../composables/response'
import VCardWrapper from './v-card-wrapper.vue'
import { useResizeObserver } from '@vueuse/core'
import { useKlicker } from '../../composables'

export default defineComponent({
  components: {
    BVega,
    BPaginator,
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { translate } = useKlicker()
    const { $klicker, comparing, dimensions, metrics, switchResponse } = useCubeResponseProps(props)

    const values = computed(() => switchResponse(response => response.data, response => response.data.flatMap(e => [{
      dimensions: e.dimensions,
      metrics: e.metrics,
      metricsRaw: e.metricsRaw,
      metricsCI: e.test.reference.metricsCI,
      source: response.query.name ?? translate('comparison.dataset.test'),
      stars: e.test.difference.pValueStars,
    }, {
      id: e.id,
      dimensions: e.dimensions,
      metrics: e.test.reference.metrics,
      metricsRaw: e.test.reference.metricsRaw,
      metricsCI: e.test.reference.metricsCI,
      source: response.query.reference.name ?? translate('comparison.dataset.reference'),
      stars: '',
    }])))

    const spec = computed<VisualizationSpec>(() => {
      const dimension0 = dimensions.value[0]
      const metric0 = metrics.value[0]

      const withCI = values.value[0].metricsCI[metric0.id] != undefined

      return {
        data: {
          values: values.value.slice(page.value * pageSize.value, (page.value + 1) * pageSize.value),
        },
        encoding: {
          x: {
            field: 'dimensions.' + dimension0.id,
            type: dimension0.type,
            title: $klicker.getName(dimension0),
            scale: dimension0.scale,
            sort: {
              field: metric0.id,
              order: metric0.sign == -1 ? 'descending' : 'ascending',
            },
          },
          y: {
            ...metric0.vega,
            field: 'metricsRaw.' + metric0.id,
            type: metric0.type,
            title: metric0.name,
            axis: {
              format: metric0.formatter,
            },
            stack: null,
          },
          tooltip: <any>[{ // TODO spread breaks types
            field: 'metrics.' + metric0.id,
            title: $klicker.getName(metric0),
          }, {
            field: 'dimensions.' + dimension0.id,
            title: $klicker.getName(dimension0),
          },
          ...(withCI ? [{
            field: 'upper',
            type: 'quantitative',
            title: translate('confidence-interval.lower', { percent: 95 }),
          }, {
            field: 'lower',
            type: 'quantitative',
            title: translate('confidence-interval.upper', { percent: 95 }),
          }] : []),
          ],
        },
        ...(withCI ? {
          // workaround for https://stackoverflow.com/questions/67358393/trouble-with-errorband-and-nested-properties
          transform: [{
            calculate: 'datum.metricsCI.' + metric0.id + '.lower',
            as: 'lower',
          }, {
            calculate: 'datum.metricsCI.' + metric0.id + '.mean',
            as: 'metrics.' + metric0.id,
          }, {
            calculate: 'datum.metricsCI.' + metric0.id + '.upper',
            as: 'upper',
          }],
        } : {}),
        layer: [{
          mark: 'bar',
          encoding: {
            ...(comparing.value ? {
              color: {
                field: 'source',
                legend: {
                  title: null,
                  offset: 8,
                  orient: 'top',
                },
              },
              opacity: {
                value: 0.75,
              },
            } : {}),
          },
        },
        ...(withCI ? [{
          mark: 'errorbar' as 'errorbar',
          encoding: {
            y: {
              ...metric0.vega,
              field: 'lower',
              type: 'quantitative' as 'quantitative',
            },
            y2: {
              field: 'upper',
              title: metric0.name,
            },
          },
        }] : []) as any,
        ...(comparing.value ? [{
          mark: {
            type: 'text',
            align: 'center',
            baseline: 'top',
          },
          encoding: {
            text: {
              field: 'stars',
              type: 'nominal',
            },
          },
        }] : []) as any // FIXME spread breaks types
        ]
      }
    })

    const page = ref(0)
    const pageSize = ref(values.value.length)
    const wrapper = ref<HTMLElement>()

    useResizeObserver(wrapper, () => window.requestAnimationFrame(() => {
      if (wrapper.value == undefined) {
        return
      }

      const pxAvailableWidth = wrapper.value.getBoundingClientRect().width - 100
      const pxPerBar = 12
      pageSize.value = Math.min(Math.max(Math.floor(pxAvailableWidth / pxPerBar), 1), values.value.length)
    }))

    return {
      wrapper,
      values,
      spec,
      page,
      pageSize,
    }
  },
})
</script>
