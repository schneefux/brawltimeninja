<template>
  <b-scrolling-list
    :items="player.battles"
    :cell-rows="2"
    :cell-columns="4"
    :eager-until="3"
    key-id="timestamp"
  >
    <template v-slot:preview="battle">
      <div
        class="w-10 h-10 p-2 flex justify-center items-center"
        :class="{
          'bg-red-500': battle.victory === false,
          'bg-green-500': battle.victory === true,
          'bg-gray-400': battle.victory == undefined,
        }"
      >
        <media-img
          :path="`/modes/${camelToKebab(battle.event.mode)}/icon`"
          size="120"
        ></media-img>
      </div>
    </template>

    <template v-slot:item="battle">
      <player-battle
        :battle="battle"
        :player-tag="player.tag"
      ></player-battle>
    </template>
  </b-scrolling-list>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { Player } from '~/model/Api'
import { BScrollingList } from '@schneefux/klicker/components'
import { camelToKebab } from '~/lib/util'

export default defineComponent({
  components: {
    BScrollingList,
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
  },
  setup(props) {
    return {
      camelToKebab,
    }
  },
})
</script>
