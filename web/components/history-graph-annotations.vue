<template>
  <b-card
    v-if="annotations.length > 0"
    :elevation="0"
    dense
  >
    <template v-slot:content>
      <div class="text-xs grid grid-cols-[auto_auto] gap-x-1 gap-y-px">
        <dl
          v-for="annotation in annotations"
          :key="annotation.label"
          class="contents"
        >
          <dt>{{ annotation.label }}</dt>
          <dd
            :class="{
              'text-green-400': annotation.value > 0,
              'text-red-400': annotation.value < 0,
            }"
            class="text-right"
          >{{ (annotation.value > 0 ? '+' : '') + annotation.value }}</dd>
        </dl>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { CubeResponse } from '@schneefux/klicker/types'
import { VisualisationProps } from '@schneefux/klicker/props'
import { useI18n } from 'vue-i18n'
import { BCard } from '@schneefux/klicker/components'

interface Annotation {
  label: string
  value: number
}

export default defineComponent({
  components: {
    BCard,
  },
  props: {
    ...VisualisationProps,
    currentTrophies: {
      type: Number,
      required: true
    },
  },
  setup(props) {
    const data = computed(() => {
      const response = props.response as CubeResponse
      return response.data.map(e => ({
        timestamp: new Date(Date.parse(e.dimensions[response.query.dimensionsIds[0]])),
        trophies: e.metricsRaw[response.query.metricsIds[0]] as number,
      })).sort((e1, e2) => e2.timestamp.valueOf() - e1.timestamp.valueOf())
    })

    const getTrophyDiffToDaysAgo = (daysAgo: number, now: Date) => {
      const then = new Date(now)
      then.setDate(now.getDate() - daysAgo)

      const entry = data.value.find(e => e.timestamp <= then)
      if (entry == undefined) {
        return undefined
      }
      return props.currentTrophies - entry.trophies
    }

    const { t } = useI18n()
    const annotations = computed(() => {
      const now = new Date()
      return [{
        label: t('player.history.today'),
        value: getTrophyDiffToDaysAgo(1, now)
      }, {
        label: t('player.history.week'),
        value: getTrophyDiffToDaysAgo(7, now)
      }, {
        label: t('player.history.month'),
        value: getTrophyDiffToDaysAgo(28, now)
      }].filter((e): e is Annotation => e.value != undefined && e.value != 0)
    })

    return {
      annotations,
    }
  },
})
</script>
