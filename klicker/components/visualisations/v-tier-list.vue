<template>
  <component
    :is="vwrapper.is"
    v-bind="vwrapper.props"
  >
    <template v-slot:content>
      <ol class="leading-0">
        <li
          v-for="(entries, tier) in tiers"
          :key="tier"
          class="flex border-t-2 first:border-t-0 border-contrast/10"
        >
          <div class="w-6 mr-3 flex justify-center items-center">
            <span class="text-2xl sm:text-2xl md:text-3xl font-bold">{{ tier }}</span>
          </div>
          <ol class="flex-1 flex flex-wrap justify-start items-center">
            <d-auto
              v-for="entry in entries"
              :key="entry.id"
              :response="response"
              :row="entry"
              tag="li"
            ></d-auto>
          </ol>
        </li>
      </ol>
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

  const tierMap: TierList = {}
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
