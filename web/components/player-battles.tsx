import Vue, { PropType } from 'vue'
import { Player } from '~/model/Api'
import PlayerBattle from '~/components/player-battle'

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

    return <div>
      <div class="flex flex-wrap">
        { player.battles.filter((battle, index) => !tease || index < 6).map((battle, index) =>
        <div
          key={battle.timestamp}
          class={{
            'rounded-l border-l-2': index == 0,
            'rounded-r': index == player.battles.length - 1,
            'bg-red-500': battle.victory === false,
            'bg-green-500': battle.victory === true,
            'border-r-2 border-t-2 border-b-2 border-black w-12 h-12 bg-primary-dark flex justify-center items-center': true,
          }}
        >
          <media-img
            path={'/modes/' + battle.event.mode + '/icon'}
            size="120"
            clazz="w-8 mx-auto my-auto"
          ></media-img>
        </div>
        ) }
      </div>

      { !tease ?
      <div class="mt-2 flex flex-wrap justify-center">
        { player.battles.map((battle, index) =>
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
      : '' }
    </div>
  }
})
