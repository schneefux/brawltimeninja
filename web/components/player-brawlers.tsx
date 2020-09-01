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
  },
  render(h, { props }) {
    const player = props.player
    const tease = props.tease
    const brawlersKV = [...Object.entries(player.brawlers)]
    const brawlers = brawlersKV.map(([brawlerId, brawler]) => ({
      id: brawlerId,
      ...brawler
    }))

    return <div>
      { !tease ?
      <dl class="section leading-tight md:mx-4 flex flex-wrap py-4 px-6">
        { Object.entries(player.heroStats).map(([brawlerName, stat]) =>
        <div
          key={brawlerName}
          class="md:text-center text-xl my-1 w-full md:w-auto md:mx-auto"
        >
          <dt class="inline md:block md:text-2xl font-semibold">
            { stat.label }
          </dt>
          <dl class="inline md:block float-right md:float-none text-primary-lighter md:mt-1 font-bold">
            { stat.value }
          </dl>
        </div>
        ) }
      </dl>
      : '' }

      <div class="section">
        <div class="flex flex-wrap justify-between">
          { brawlers.filter((brawler, index) => !tease || index < 2).map(brawler =>
          <lazy
            key={brawler.id}
            class="card-wrapper w-full md:flex-1"
            distance="200px"
          >
            <div class="w-80" style="height: 107px" slot="placeholder"></div>
            <PlayerBrawlerCard
              { ...{ attrs: {
                brawler: brawler,
                'brawler-winrates': player.winrates.brawler,
                expandable: !tease,
              } } }
            ></PlayerBrawlerCard>
          </lazy>
          ) }
        </div>
      </div>
    </div>
  }
})
