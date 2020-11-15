import Vue, { PropType } from 'vue'
import { metaStatMaps } from '~/lib/util.ts'
import { Player } from '~/model/Brawlstars'

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
    const stats = {
      trophies: player.trophies,
      highestTrophies: player.highestTrophies,
      powerPlayPoints: player.powerPlayPoints,
      highestPowerPlayPoints: player.highestPowerPlayPoints,
      expLevel: player.expLevel,
      victories: player['3vs3Victories'],
      soloVictories: player.soloVictories,
      duoVictories: player.duoVictories,
    }

    const tease = props.tease
    return <dl
      class={{
        'flex flex-col md:flex-row md:flex-wrap md:justify-center': true,
        'flex-wrap justify-center': !tease,
        'h-28 md:h-10 overflow-hidden': tease,
      }}
    >
      { Object.entries(stats).map(([name, value]) =>
        <div class="darkbox mx-2 mt-1 text-lg flex flex-shrink-0 h-8">
          <dd class="text-primary-light font-semibold w-16 md:w-auto text-right">{ value }</dd>
          <dt class="ml-2 w-full overflow-hidden">{ metaStatMaps.labels[name] }</dt>
        </div>
      )}
    </dl>
    }
  })
