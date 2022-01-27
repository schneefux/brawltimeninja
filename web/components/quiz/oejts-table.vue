<template>
  <div class="grid grid-cols-[6rem,1fr,6rem] items-center text-center gap-x-1">
    <span class="mt-1 col-span-3 font-semibold">{{ oejtsAbbreviation }}</span>
    <template v-for="(value, attr) in oejts">
      <span :key="'l-' + attr" class="text-left">{{ oejtsMap[attr[0]] }}</span>
      <div
        :key="'c-' + attr"
        class="h-2 bg-gray-100 rounded relative"
      >
        <div
          :style="{ 'width': Math.min(Math.abs(value)/2 * 50, 50) + '%' }"
          :class="['h-full bg-yellow-500 absolute', {
            'left-1/2 rounded-r': value > 0,
            'right-1/2 rounded-l': value < 0,
          }]"
        ></div>
      </div>
      <span :key="'r-' + attr" class="text-right">{{ oejtsMap[attr[1]] }}</span>
    </template>
    <span class="mt-1 col-span-3">{{ $t('oejts.result.oejts') }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "@nuxtjs/composition-api"
import { OEJTSEntry } from "~/lib/oejts"

export default defineComponent({
  props: {
    oejts: {
      type: Object as PropType<OEJTSEntry>,
      required: true
    },
  },
  setup(props) {
    const oejtsAbbreviation = computed(() => {
      if (props.oejts == undefined) {
        return ''
      }
      return Object.entries(props.oejts)
        .map(([name, number]) => number < -0.1 ? name[0] : number > 0.1 ? name[1] : 'x')
        .join('')
        .toUpperCase()
    })

    const oejtsMap = {
      i: 'Introversion',
      e: 'Extraversion',
      s: 'Sensing',
      n: 'Intuition',
      f: 'Feeling',
      t: 'Thinking',
      j: 'Judging',
      p: 'Perceiving',
    }

    return {
      oejtsMap,
      oejtsAbbreviation,
    }
  },
})
</script>
