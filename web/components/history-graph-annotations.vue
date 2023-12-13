<template>
  <b-card
    v-if="annotations.length > 0"
    :elevation="0"
    dense
  >
    <template v-slot:content>
      <div class="text-xs grid grid-cols-[auto,auto] gap-x-1 gap-y-px">
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
    const response = props.response as CubeResponse
    const timestamps = response.data.map(e => new Date(Date.parse(e.dimensions[response.query.dimensionsIds[0]])))
    const trophies = response.data.map(e => e.metricsRaw[response.query.metricsIds[0]] as number)

    const getTrophyDiffToDaysAgo = (daysAgo: number, now: Date) => {
      const then = new Date(now)
      then.setDate(now.getDate() - daysAgo)

      const index = timestamps.findIndex(t => t <= then)
      if (index == -1) {
        return undefined
      }
      return props.currentTrophies - trophies[index]
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
