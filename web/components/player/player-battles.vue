<template>
  <b-scrolling-list
    :items="player.battles"
    :cell-rows="2"
    :cell-columns="4"
    key-id="timestamp"
    render-placeholder
    @scroll.once="$emit('interact')"
  >
    <template v-slot:preview="battle">
      <media-img
        :path="`/modes/${camelToKebab(battle.event.mode)}/icon`"
        :alt="$t('mode.' + battle.event.mode)"
        :clazz="'w-8 h-8 object-contain p-1 rounded-full ' +
          (battle.victory === false ? 'bg-red-500/75' : '') +
          (battle.victory === true ? 'bg-green-500/75' : '') +
          (battle.victory == undefined ? 'bg-gray-400' : '')
        "
        size="160"
      ></media-img>
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
