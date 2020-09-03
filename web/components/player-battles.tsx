import Vue, { PropType } from 'vue'
import { Player } from '~/model/Api'
import PlayerBattle from '~/components/player-battle'

export default Vue.extend({
  functional: true,
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
  },
  render(h, { props }) {
    const player = props.player

    return <div class="mt-2 flex flex-wrap justify-center">
      { player.battles.map(battle =>
      <lazy
        key={battle.timestamp}
        class={{
          'md:w-1/2 lg:w-1/2 px-2': true,
        }}
        distance="640px"
      >
        <div class="w-80" style="height: 214px" slot="placeholder"></div>
        <PlayerBattle
          { ... { attrs: {
            battle: battle,
            playerTag: player.tag,
          } } }
        ></PlayerBattle>
      </lazy>
      ) }
    </div>
  }
})
