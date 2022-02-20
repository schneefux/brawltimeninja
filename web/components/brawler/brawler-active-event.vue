<template>
  <event-card
    :mode="mode"
    :map="map"
    :id="id"
    full-height
  >
    <p v-if="end != undefined" slot="infobar" class="text-right">
      {{ $t('time.ends-in', { time: timeTillEnd }) }}
    </p>

    <b-card
      slot="content"
      :elevation="0"
      dense
    >
      <div
        slot="content"
        class="flex items-end"
      >
        <media-img
          :path="`/brawlers/${brawlerId}/avatar`"
          :alt="brawlerName"
          size="128"
          clazz="w-16 mr-2"
        ></media-img>
        <kv-table
          v-if="table.length > 0"
          class="w-48 px-3 py-2"
          :data="table"
        ></kv-table>
        <div
          v-else
          class="w-48 flex"
          style="height: 112px;"
        >
          <p class="m-auto">{{ $t('state.no-data') }}</p>
        </div>
      </div>
    </b-card>
  </event-card>
</template>

<script lang="ts">
import { computed, defineComponent, useAsync, useContext } from '@nuxtjs/composition-api'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { brawlerId as getBrawlerId } from '@/lib/util'
import { useRateMetric } from '~/lib/klicker.conf'
import { BCard } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BCard,
  },
  props: {
    mode: {
      // camel case
      type: String,
      required: true
    },
    map: {
      type: String,
      required: true
    },
    id: {
      type: [String, Number],
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
    end: {
      type: String,
    },
  },
  setup(props) {
    const { $klicker, i18n } = useContext()

    const dataEntry = useAsync(async () => {
      const data = await $klicker.query({
        cubeId: 'map',
        slices: {
          map: [props.map],
          mode: [props.mode],
        },
        dimensionsIds: ['brawler'],
        metricsIds: ['winRate', 'picks', 'useRate', 'wins'],
        sortId: 'picks',
      })

      return data.data.filter(e => e.dimensionsRaw.brawler.brawler == props.brawlerName.toUpperCase())[0]
    })

    const useRate = computed(() => dataEntry.value?.metricsRaw?.useRate as number || 0)
    const timeTillEnd = computed(() => {
      if (props.end == undefined) {
        return ''
      }
      return formatDistanceToNow(parseISO(props.end))
    })

    const table = computed(() => {
      if (dataEntry.value == undefined) {
        return []
      }
      return [
        [ i18n.tc('metric.picks'), dataEntry.value.metrics.picks ],
        [ i18n.tc('metric.useRate'), $klicker.format(useRateMetric, useRate.value) ],
        [ i18n.tc('metric.winRate'), dataEntry.value.metrics.winRate ],
      ]
    })

    const brawlerId = computed(() => getBrawlerId({ name: props.brawlerName }))

    return {
      timeTillEnd,
      table,
      brawlerId,
    }
  },
})
</script>
