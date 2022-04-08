<template>
  <b-scrolling-list
    :items="brawlers"
    :cell-rows="3"
    :cell-columns="3"
    key-id="brawlerId"
    render-placeholder
  >
    <template v-slot:preview="brawler">
      <div class="w-8 h-8 flex justify-center items-center">
        <media-img
          :path="`/brawlers/${brawler.brawlerId}/avatar`"
          size="160"
        ></media-img>
      </div>
    </template>

    <template v-slot:item="brawler">
      <player-brawler-card
        :brawler="brawler"
        :player-tag="player.tag"
        :enable-klicker-stats="enableKlickerStats"
      ></player-brawler-card>
    </template>
  </b-scrolling-list>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api'
import { Player } from '~/model/Api'
import { BScrollingList } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BScrollingList,
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
    enableKlickerStats: {
      type: Boolean,
      required: true
    },
  },
  setup(props) {
    const brawlers = computed(() => Object.entries(props.player.brawlers).map(([id, brawler]) => ({
      ...brawler,
      brawlerId: id,
    })))

    return {
      brawlers,
    }
  },
})
</script>
