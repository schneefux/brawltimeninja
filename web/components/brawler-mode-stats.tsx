import Vue, { PropType } from 'vue'
import { formatMode, metaStatMaps } from '~/lib/util';
import { ModeMetaMap } from '~/model/MetaEntry';

export default Vue.extend({
  functional: true,
  props: {
    // TODO update brawler endpoint to return this data
    modeMeta: {
      type: Object as PropType<ModeMetaMap>,
      required: true,
    },
    brawlerId: {
      type: String,
      required: true
    },
  },
  render(h, { props }) {
    // transpose { mode: { brawler} } to { brawler: mode }
    const modes = [...Object.values(props.modeMeta)]
        .map(meta => [...Object.entries(meta.brawlers)]
          .map(([brawlerId, brawler]) => ({
            mode: meta.mode,
            brawlerId,
            ...brawler
          }))
        )
        .reduce((allEntries, modeEntries) => allEntries.concat(...modeEntries), [])
        .filter(({ brawlerId }) => brawlerId === props.brawlerId)
        .sort((m1, m2) => m2.sampleSize - m1.sampleSize)

    const mediaUrl = process.env.mediaUrl

    return <div class="flex flex-wrap">
      { modes.map(entry =>
      <div
        key={entry.mode}
        class="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 card-wrapper mx-auto z-10"
      >
        <div
          class="items-center card bg-center bg-cover h-full relative"
          style={{
            'background-image': `linear-gradient(rgba(0, 0, 0, 0.70), rgba(0, 0, 0, 0.70)), url('${mediaUrl}/modes/${entry.mode}/background.jpg?size=1024')`,
          }}
        >
          <div class="relative z-10 card__content">
            <span class="card__header">
              { formatMode(entry.mode) }
            </span>
            <div class="card__props">
              <table class="w-full">
                <tbody>
                  { Object.keys(entry.stats).map(prop =>
                  <tr
                    key={prop}
                    class="card__props whitespace-no-wrap"
                  >
                    <td class="card-prop-label">
                      { metaStatMaps.labels[prop] }
                    </td>
                    <td class="card-prop-value text-right pl-1">
                      { metaStatMaps.formatters[prop](entry.stats[prop]) }
                    </td>
                  </tr>
                  ) }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )} </div>
  }
});
