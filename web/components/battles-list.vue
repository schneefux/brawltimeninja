<template>
  <b-scrolling-list
    v-if="battles.length > 0"
    :items="battles"
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
          (battle.result == 'Draw' || battle.victory == undefined ?
            'bg-gray-400' :
            (battle.victory === true ? 'bg-green-500/75' : 'bg-red-500/75')
          )
        "
        size="160"
      ></media-img>
    </template>

    <template v-slot:item="battle">
      <battle
        :battle="battle"
        :highlight-tags="highlightTags"
      ></battle>
    </template>
  </b-scrolling-list>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Battle } from '~/model/Api'
import { BScrollingList } from '@schneefux/klicker/components'
import { camelToKebab } from '~/lib/util'

export default defineComponent({
  components: {
    BScrollingList,
  },
  props: {
    battles: {
      type: Object as PropType<Battle[]>,
      required: true
    },
    highlightTags: {
      type: Array as PropType<string[]>,
      default: []
    },
  },
  setup(props) {
    return {
      camelToKebab,
    }
  },
})
</script>
