<template>
  <b-scrolling-list
    v-if="modes != undefined && events != undefined"
    :items="modes"
    :cell-rows="3"
    :cell-columns="4"
    :eager-until="3"
    key-id="id"
  >
    <template v-slot:preview="mode">
      <div class="w-10 h-10 p-2 flex justify-center items-center bg-white/[0.1]">
        <media-img
          :path="`/modes/${mode.slug}/icon`"
          size="120"
          clazz="max-w-8 max-h-8"
        ></media-img>
      </div>
    </template>

    <template v-slot:item="mode">
      <player-mode-card
        :mode="mode.id"
        :battles="battles"
        :active-events="events"
        :player-brawlers="Object.values(player.brawlers)"
        :player-tag="player.tag"
        :enable-klicker-stats="enableKlickerStats"
      ></player-mode-card>
    </template>
  </b-scrolling-list>
</template>

<script lang="ts">
import {defineComponent, PropType, useContext, useAsync, computed} from '@nuxtjs/composition-api'
import { Player, Battle } from '~/model/Api'
import { BScrollingList } from '@schneefux/klicker/components'
import { camelToKebab } from '~/lib/util'

export default defineComponent({
  components: {
    BScrollingList,
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
    battles: {
      type: Array as PropType<Battle[]>,
      default: []
    },
    enableKlickerStats: {
      type: Boolean,
      required: true
    },
  },
  setup() {
    const { $klicker } = useContext()
    const events = useAsync(() => $klicker.queryActiveEvents())

    const modesIds = useAsync(() => $klicker.queryAllModes())
    const modes = computed(() => modesIds.value?.map(m => ({
      id: m,
      slug: camelToKebab(m),
    })))

    return {
      modes,
      events,
    }
  },
})
</script>
