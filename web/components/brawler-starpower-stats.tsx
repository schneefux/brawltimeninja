import Vue, { PropType } from 'vue'
import { StarpowerMetaStatistics, GadgetMetaStatistics } from '~/model/Api'
import { metaStatMaps, capitalize } from '~/lib/util'

export default Vue.extend({
  functional: true,
  props: {
    starpowerMeta: {
      type: Array as PropType<StarpowerMetaStatistics[]&GadgetMetaStatistics[]>,
      default: [],
    },
    brawlerId: {
      type: String,
      required: true
    },
    descriptions: {
      type: Object as PropType<{ [key: string]: string }|null>,
      required: false
    },
    kind: {
      type: String, // 'starpowers', 'gadgets'
      required: true
    },
  },
  render(h, { props }) {
    const kind = props.kind
    const brawlerId = props.brawlerId
    const descriptions = props.descriptions
    const getName = (entry: StarpowerMetaStatistics|GadgetMetaStatistics) =>
      kind == 'gadgets' ? (entry as GadgetMetaStatistics).gadgetName : (entry as StarpowerMetaStatistics).starpowerName

    // TODO update brawler endpoint to return this data
    const starpowers = props.starpowerMeta
        .filter(entry => entry.brawlerName === brawlerId && getName(entry).length > 0)
        .sort((e1, e2) => e2.sampleSize - e1.sampleSize)

    return <div class="flex flex-wrap justify-around">
      { starpowers.map(entry =>
      <div
        key={entry.id}
        class="card card--dark card--sm card__content flex items-center"
      >
        <media-img
          path={`/${kind}/${entry.id}`}
          clazz="w-20 pr-6"
          size="140"
        ></media-img>
        <dl class="w-full flex flex-col h-full">
          <dt class="card__header">{ kind == 'gadgets' ? 'Gadget' : 'Star Power' }: { capitalize(getName(entry).toLowerCase()) }</dt>
          { descriptions != null ?
          <dd class="card__text mb-3 h-full">
            { descriptions[getName(entry)] }
          </dd>
          : '' }
          <div class="flex justify-between">
            <dt class="font-semibold">{ capitalize(getName(entry).toLowerCase()) } Win Rate</dt>
            <dd>{ metaStatMaps.formatters.winRate(entry.stats.winRate) }</dd>
          </div>
        </dl>
      </div>
      ) }
    </div>
  }
})
