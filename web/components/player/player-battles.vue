<template>
  <div>
    <ul class="flex md:flex-wrap overflow-x-auto">
      <li
        v-for="(battle, index) in player.battles"
        :key="battle.timestamp"
      >
        <button
          @click="scrollTo(battle.timestamp)"
          class="w-12 h-12 p-2 flex justify-center items-center"
          :class="['border-r-2 border-t-2 border-b-2 border-gray-900', {
            'rounded-l border-l-2': index == 0,
            'rounded-r': index == player.battles.length - 1,
            'bg-red-500': battle.victory === false,
            'bg-green-500': battle.victory === true,
            'bg-gray-400': battle.victory == undefined,
          }]"
        >
          <media-img
            :path="'/modes/' + camelToKebab(battle.event.mode) + '/icon'"
            size="120"
          ></media-img>
        </button>
      </li>
    </ul>

    <b-scrolling-dashboard class="mt-4">
      <c-dashboard-cell
        v-for="(battle, index) in player.battles"
        :key="battle.timestamp"
        :ref="battle.timestamp"
        :columns="4"
        :rows="2"
        :lazy="index > 3"
        :ssr-key="`player-battles-${battle.timestamp}`"
      >
        <player-battle
          :battle="battle"
          :player-tag="player.tag"
        ></player-battle>
      </c-dashboard-cell>
    </b-scrolling-dashboard>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { Player } from '~/model/Api'
import { CDashboardCell } from '@schneefux/klicker/components'
import { camelToKebab } from '~/lib/util'

export default defineComponent({
  components: {
    CDashboardCell,
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
  },
  // TODO replace by function ref when migrating to Vue 3
  setup(props, { refs }) {
    const scrollTo = (id: string) => {
      const element = refs[id][0].$el as HTMLElement
      element.scrollIntoView({ behavior: 'smooth' })
    }

    return {
      camelToKebab,
      scrollTo,
    }
  },
})
</script>
