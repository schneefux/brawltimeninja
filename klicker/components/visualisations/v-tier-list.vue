<template>
  <component
    :is="vwrapper.is"
    v-bind="vwrapper.props"
  >
    <template v-slot:content>
      <ul class="space-y-2">
        <li
          v-for="(entries, tier) in tiers"
          :key="tier"
          class="flex"
        >
          <div class="w-6 mr-3 flex justify-center items-center">
            <span class="text-2xl sm:text-2xl md:text-3xl font-bold">{{ tier }}</span>
          </div>
          <ul class="w-full flex flex-wrap justify-start items-center">
            <li
              v-for="entry in entries"
              :key="entry.id"
              class="my-px"
            >
              <d-auto
                :response="response"
                :row="entry"
              ></d-auto>
            </li>
          </ul>
        </li>
      </ul>
    </template>
  </component>
</template>

<script lang="ts">
import { computed, toRef, defineComponent } from 'vue'
import { Metric, MetaGridEntry } from '../../types'
import { VisualisationProps } from '../../props'
import { scaleEntriesIntoTiers } from '../../util'
import { useCubeResponseProps } from '../../composables/response'
import DAuto from './d-auto.vue'
import { useVWrapper, vwrappers } from '../../composables/vwrapper'

export interface TierList {
  [tier: string]: MetaGridEntry[]
}

function groupTiers(entries: MetaGridEntry[], m: Metric): TierList {
  if (entries.length <= 2) {
    return {}
  }

  const scaledEntries = scaleEntriesIntoTiers(entries, m)

  const tierMap = { S: [], A: [], B: [], C: [], D: [] } as Record<string, MetaGridEntry[]>
  scaledEntries.forEach(e => e.tier in tierMap ? tierMap[e.tier].push(e) : tierMap[e.tier] = [e])

  return tierMap
}

export default defineComponent({
  components: {
    DAuto,
    ...vwrappers,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { metrics } = useCubeResponseProps(props)
    const tiers = computed(() => groupTiers(props.response.data, metrics.value[0]))

    const vwrapper = useVWrapper(toRef(props, 'card'), toRef(props, 'loading'))

    return {
      vwrapper,
      tiers,
    }
  },
})
</script>
