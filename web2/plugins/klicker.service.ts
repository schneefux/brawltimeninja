import { Config, SlicerSpec, StaticWidgetSpec, ValueType, VisualisationSpec, DimensionRendererSpec, MetricRendererSpec } from "@schneefux/klicker/types"
import { formatMode, idToTag } from "~/lib/util"
import KlickerService from '@schneefux/klicker/service'

export interface EventMetadata {
  key: string
  id: string
  map: string
  mode: string
  start?: string
  end?: string
  powerplay: boolean
  metrics: Record<string, string|number>
}

export { BrawltimeKlickerService }

class BrawltimeKlickerService extends KlickerService {
  constructor(cubeUrl: string,
      config: Config,
      visualisations: VisualisationSpec[],
      staticWidgets: StaticWidgetSpec[],
      slicers: SlicerSpec[],
      dimensionRenderers: DimensionRendererSpec[],
      metricRenderers: MetricRendererSpec[]) {
    super(cubeUrl, config, visualisations, staticWidgets, slicers, dimensionRenderers, metricRenderers)
  }

  /*
  // override Klicker.$t
  public $te(key: string) {
    return this.context.i18n.t(key) != key
  }

  // override Klicker.$t
  public $t(key: string, args?: any) {
    if (this.$te(key)) {
      return this.context.i18n.t(key, args)
    }
    return super.$t(key, args)
  }
  */

  // override Klicker.format
  public format(spec: { type: ValueType, formatter?: string }, value: number|string|string[]): string {
    if (spec.type == 'nominal' && typeof value == 'string') {
      if (spec.formatter == 'formatMode') {
        // TODO remove for i18n
        return formatMode(value)
      }
      if (spec.formatter == 'idToTag') {
        return idToTag(value)
      }
    }
    if (spec.type == 'ordinal' && typeof value == 'number') {
      if (spec.formatter == 'trophyRange') {
        // TODO format leagues
        return (value * 100) as any as string // TODO allow format to return numbers
      }
    }
    return super.format(spec, value)
  }
}
