<template>
  <div
    :class="['flex flex-wrap justify-center', {
      'h-12 overflow-y-hidden': tease,
    }]"
  >
    <div
      v-for="(battle, index) in battles"
      :key="battle.timestamp"
      :class="['border-r-2 border-t-2 border-b-2 border-gray-900 w-12 h-12 flex justify-center items-center', {
        'rounded-l border-l-2': index == 0,
        'rounded-r': index == battles.length - 1,
        'bg-red-500': battle.victory === false,
        'bg-green-500': battle.victory === true,
        'bg-gray-400': battle.victory == undefined,
      }]"
    >
      <media-img
        :path="'/modes/' + camelToKebab(battle.event.mode) + '/icon'"
        size="120"
        clazz="w-8 mx-auto my-auto"
      ></media-img>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { Battle } from '~/model/Api'
import { camelToKebab } from '~/lib/util'

export default defineComponent({
  props: {
    battles: {
      type: Array as PropType<Battle[]>,
      default: () => []
    },
    tease: {
      type: Boolean,
      default: false
    },
  },
  setup() {
    return {
      camelToKebab,
    }
  },
})
</script>
