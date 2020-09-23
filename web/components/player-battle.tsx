import Vue, { PropType } from 'vue'
import EventCard from '~/components/event-card'
import { hoursSinceDate } from '~/lib/util'
import TrophyIcon from '~/assets/images/icon/trophy_optimized.png'
import PowerPlayIcon from '~/assets/images/icon/power_play_optimized.png'
import { Battle } from '~/model/Api'

export default Vue.extend({
  functional: true,
  props: {
    battle: {
      type: Object as PropType<Battle>,
      required: true,
    },
    playerTag: {
      type: String,
      required: true,
    },
  },
  render(h, { props }) {
    const battle = props.battle
    const playerTag = props.playerTag

    // TODO receive this from backend
    const isPowerplay = battle.victory != undefined && battle.trophyChange != undefined
      && (battle.victory && battle.trophyChange > 11 || !battle.victory && battle.trophyChange > 3)

    const hoursSinceBattle = hoursSinceDate(battle.timestamp as string)
    const infobar = <div class="flex justify-between">
        <div>
          <span class="mr-2">
            { battle.result }
          </span>
          { battle.trophyChange !== undefined ?
            <span>
              { battle.trophyChange > 0 ? '+' : ''}{ battle.trophyChange }
              <img
                src={isPowerplay ? PowerPlayIcon : TrophyIcon}
                class="w-4 inline"
              />
            </span>
            : ''
          }
        </div>
        <span>
          { hoursSinceBattle == 0 ? 'just now' : (hoursSinceBattle + 'h ago') }
        </span>
      </div>

    const content = <div class="flex flex-wrap justify-center">
      { battle.teams.map((team, index) =>
        <div
          key={index}
          class={
            "flex flex-wrap justify-center z-10 my-1 "
            + (battle.teams.length == 3 ? 'mt-8 ' : '')
            + (team.length == 2 ? 'mx-1 rounded-sm flex-col ' : '')
          }
        >
          { team.map((mate) =>
            <nuxt-link
              key={mate.tag}
              rel={mate.brawlerTrophies == undefined || mate.brawlerTrophies < 1300 ? 'nofollow' : ''}
              to={`/player/${mate.tag}`}
              class={
                'w-14 h-14 bg-gray-800 py-px relative overflow-hidden '
                + (mate.tag == playerTag ? 'border-2 border-gray-300 ' : '')
                + (team.length != 2 ? 'mx-1 rounded-sm ' : '')
              }
            >
              <media-img
                path={'/brawlers/' + mate.brawler + '/avatar'}
                size="160"
                clazz="h-8"
              ></media-img>
                <div class="absolute top-0 right-0 w-12 text-right m-px">
                { mate.brawlerTrophies ?
                  <div class="w-full flex">
                    <span
                      class="w-8 text-xs font-semibold text-shadow text-secondary-lighter"
                    >
                      { mate.brawlerTrophies }
                    </span>
                    <img
                      src={isPowerplay ? PowerPlayIcon : TrophyIcon}
                      class="w-4 h-4 ml-px"
                    />
                  </div>
                  : ''
                }
                <div class="w-full">
                  { mate.isBigbrawler ?
                    <span class="text-sm">💀</span>
                    : ''
                  }
                </div>
              </div>
              <span
                class={
                  "text-xs whitespace-no-wrap m-px "
                  + (mate.tag != playerTag ? 'link ' : 'text-secondary')
                }>
                  { mate.name }
                </span>
              </nuxt-link>
          ) }
          </div>
      ) }
      </div>

    const slots = {
      infobar: () => infobar,
      content: () => content,
    }

    const eventCard = EventCard as any
    return <eventCard
        mode={battle.event.mode}
        map={battle.event.map}
        size="w-80"
        scopedSlots={slots}
      />
  }
})
