import { ValueType } from "@schneefux/klicker/types"
import { formatMode, idToTag } from "../lib/util"
import KlickerService from '@schneefux/klicker/service.js'
import config from '../lib/klicker.cubes'
import visualisations from '../lib/klicker.visualisations.conf'
import staticWidgets from '../lib/klicker.widgets.conf'
import slicers from '../lib/klicker.slicers.conf'
import { dimensionRenderers, metricRenderers } from '../lib/klicker.renderers'

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
  constructor(cubeUrl: string, fetchImplementation: typeof fetch) {
    super(
      cubeUrl,
      config,
      visualisations,
      staticWidgets,
      slicers,
      dimensionRenderers,
      metricRenderers,
      fetchImplementation,
    )
  }

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
