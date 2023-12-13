<template>
  <div class="h-64">
    <b-card
      :loading="loading"
    >
      <template v-slot:content>
        <b-vega
          :spec="spec"
          class="h-32"
          show-download
          full-width
          full-height
        ></b-vega>
      </template>
    </b-card>
  </div>
</template>

<script lang="ts">
import { ObserveVisibility } from 'vue-observe-visibility'
import { defineComponent, computed, PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { BVega, BCard } from '@schneefux/klicker/components'
import { VisualizationSpec } from 'vega-embed'
import { ClubActivityStatistics } from '~/model/Api'
import { useDateFnLocale } from '~/composables/date-fns'
import { formatDistanceToNow } from 'date-fns'

export default defineComponent({
  directives: {
    ObserveVisibility,
  },
  components: {
    BVega,
    BCard,
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    clubActivityStatistics: {
      type: Object as PropType<ClubActivityStatistics>,
      required: false
    },
  },
  async setup(props) {
    const { locale } = useDateFnLocale()
    const toRelativeTime = (time: Date) => formatDistanceToNow(time, {
      addSuffix: true,
      locale: locale.value,
    })

    const { t } = useI18n()

    const lastActive = computed(() => [...Object.values(props.clubActivityStatistics?.lastActive ?? {})
      .filter((v): v is Date => v != undefined)
    ])

    const spec = computed((): VisualizationSpec => {
      const retentions: { daysAgo: string, retention: number }[] = []
      for (let daysOffset = 0; daysOffset < 7; daysOffset++) {
        const dateDaysAgo = new Date()
        dateDaysAgo.setDate(dateDaysAgo.getDate() - daysOffset - 1)
        const retention = lastActive.value.filter(t => t > dateDaysAgo).length / lastActive.value.length * 100
        retentions.push({
          daysAgo: toRelativeTime(dateDaysAgo),
          retention,
        })
      }

      return {
        data: {
          values: retentions,
        },
        encoding: {
          x: {
            field: 'daysAgo',
            type: 'ordinal',
            title: t('club.retention.days-ago'),
          },
          y: {
            field: 'retention',
            type: 'quantitative',
            title: t('club.retention.retention'),
            scale: {
              domain: [0, 100],
            },
          },
        },
        layer: [{
          mark: 'line',
        }],
        resolve: {
          legend: {
            // https://github.com/vega/vega-lite/issues/6259#issuecomment-609069125
            color: 'independent',
          },
        },
      }
    })

    return {
      spec,
    }
  },
})
</script>
