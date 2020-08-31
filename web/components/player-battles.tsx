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
    battlePageSize: {
      type: Number,
      default: 5
    },
    battlePage: {
      type: Number,
      required: true
    },
    tease: {
      type: Boolean,
      default: false
    },
  },
  render(h, { props }) {
    const player = props.player
    const tease = props.tease
    const battlePage = props.battlePage
    const battlePageSize = props.battlePageSize

    return <div class="overflow-x-auto -mx-4 overflow-y-hidden scrolling-touch flex flex-wrap flex-1">
      <div class="w-full mx-2 mb-2 flex md:flex-wrap min-width-min-content">
        { player.battles.filter((battle, index) => !tease || index < 5).map((battle, index) =>
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
      <div class="w-full flex md:flex-wrap">
        { player.battles.map((battle, index) =>
        <lazy
          key={battle.timestamp}
          class={{
            'md:hidden': battlePage * battlePageSize <= index,
            'flex-0-auto md:flex-initial md:w-1/2 lg:w-1/2 px-2': true,
          }}
          render={index <= battlePageSize}
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
