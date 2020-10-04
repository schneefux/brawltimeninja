import Vue, { PropType } from 'vue'
import { Player } from '~/model/Api'
import PlayerBrawlerCard from '~/components/player-brawler-card'

export default Vue.extend({
  functional: true,
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
    tease: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      required: false
    },
    enableClickerStats: {
      type: Boolean,
      required: true
    },
  },
  render(h, { props }) {
    const player = props.player
    const tease = props.tease
    const limit = tease ? 3 : props.limit
    const brawlersKV = [...Object.entries(player.brawlers)]
    const brawlers = brawlersKV.map(([brawlerId, brawler]) => ({
      id: brawlerId,
      ...brawler
    }))
    const enableClickerStats = props.enableClickerStats

    return <div class="-my-2 flex flex-wrap justify-between">
      { brawlers.slice(0, limit).map(brawler =>
      <lazy
        key={brawler.id}
        class="card-wrapper w-full md:flex-1"
        distance="200px"
      >
        <div class="w-80" style="height: 107px" slot="placeholder"></div>
        <PlayerBrawlerCard
          { ...{ attrs: {
            brawler: brawler,
            playerTag: player.tag,
            enableClickerStats: enableClickerStats,
          } } }
        ></PlayerBrawlerCard>
      </lazy>
      ) }
    </div>
  }
})
