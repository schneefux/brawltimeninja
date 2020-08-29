import Vue, { PropType } from 'vue'
import { StarpowerMetaStatistics, BrawlerMetaStatistics, GadgetMetaStatistics } from '~/model/Api'
import { metaStatMaps } from '~/lib/util'
import { BrawlerData } from '~/model/Media'

export default Vue.extend({
  functional: true,
  props: {
    starpowerMeta: {
      type: Array as PropType<StarpowerMetaStatistics[]>,
      default: [],
    },
    gadgetMeta: {
      type: Array as PropType<GadgetMetaStatistics[]>,
      default: [],
    },
    brawlerId: {
      type: String,
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
    brawlerData: {
      type: Object as PropType<BrawlerData>,
      required: false
    },
    stats: {
      type: Object as PropType<BrawlerMetaStatistics>,
      required: false
    },
  },
  render(h, { props }) {
    const brawlerData = props.brawlerData
    const brawlerId = props.brawlerId
    const brawlerName = props.brawlerName
    const stats = props.stats
    // TODO update brawler endpoint to return this data
    const noStarpowerStats = props.starpowerMeta
        .find(entry => entry.brawlerName === brawlerId && entry.starpowerName.length == 0)
    const noGadgetStats = props.gadgetMeta
        .find(entry => entry.brawlerName === brawlerId && entry.gadgetName.length == 0)

    return <div class="flex flex-wrap justify-around">
      <div class="w-full flex justify-center">
        <div class="w-full max-w-2xl card card--dark md:py-10">
          <div class="card__content max-w-md flex flex-wrap md:flex-no-wrap justify-center items-center mx-auto">
            <media-img
              path={'/brawlers/' + brawlerId + '/model'}
              clazz="w-32 md:w-48 md:pr-6"
              size="500"
            ></media-img>
            <dl class="w-full">
              <dt class="card__header">{ brawlerName }</dt>
              <dd class="card__text mb-3 whitespace-pre-line">
                { brawlerData.description }
              </dd>
              <div class="flex justify-between">
                <dt class="font-semibold">Health at Level 1</dt>
                <dd>{ brawlerData.health }</dd>
              </div>
              <div class="flex justify-between">
                <dt class="font-semibold">Health at Level 10</dt>
                <dd>{ Math.round(brawlerData.health * 1.4) }</dd>
              </div>
              <div class="flex justify-between">
                <dt class="font-semibold">Speed</dt>
                <dd>{ brawlerData.speed }</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      { brawlerData != null ? ['main', 'super'].map(attack =>
      <div
        key={attack}
        class="card card--dark card--sm card__content"
      >
        <dl class="flex flex-col h-full">
          <dt class="card__header">{ attack == 'main' ? 'Main Attack' : 'Super' }</dt>
          <dd class="card__text mb-3 h-full whitespace-pre-line">
            { brawlerData[attack].description }
          </dd>
          { brawlerData[attack].rechargeTime != null ?
          <div class="flex justify-between">
            <dt class="font-semibold">Reload Speed</dt>
            <dd>{ brawlerData[attack].rechargeTime }ms</dd>
          </div>
          : '' }
          { brawlerData[attack].damage != null ?
          <div class="flex justify-between">
            <dt class="font-semibold">{ brawlerData[attack].damageLabel } at Level 1</dt>
            <dd>{ brawlerData[attack].damage }</dd>
          </div>
          : '' }
          { brawlerData[attack].damage != null ?
          <div class="flex justify-between">
            <dt class="font-semibold">{ brawlerData[attack].damageLabel } at Level 10</dt>
            <dd>{ Math.round(brawlerData[attack].damage * 1.4) }</dd>
          </div>
          : '' }
        </dl>
      </div>
      ) : '' }

      <div class="card card--dark card--sm card__content">
        <span class="card__header">{ brawlerName } Statistics</span>
        <dl class="card__text">
          { stats != null ?
          <div class="flex justify-between">
            <dt class="font-semibold">Use Rate</dt>
            <dd>{ metaStatMaps.formatters.useRate(stats.stats.useRate) }</dd>
          </div>
          : '' }
          { stats != null ?
          <div class="flex justify-between">
            <dt class="font-semibold">Star Rate</dt>
            <dd>{ metaStatMaps.formatters.starRate(stats.stats.starRate) }</dd>
          </div>
          : '' }
          { stats != null ?
          <div class="flex justify-between">
            <dt class="font-semibold">Win Rate</dt>
            <dd>{ metaStatMaps.formatters.winRate(stats.stats.winRate) }</dd>
          </div>
          : '' }
          { noStarpowerStats != null ?
          <div class="flex justify-between">
            <dt class="font-semibold">Win Rate without Star Power</dt>
            <dd>{ metaStatMaps.formatters.winRate(noStarpowerStats.stats.winRate) }</dd>
          </div>
          : '' }
          { noGadgetStats != null ?
          <div class="flex justify-between">
            <dt class="font-semibold">Win Rate without Gadget</dt>
            <dd>{ metaStatMaps.formatters.winRate(noGadgetStats.stats.winRate) }</dd>
          </div>
          : '' }
        </dl>
      </div>
    </div>
  }
})
