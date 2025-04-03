import { ValueType } from "@schneefux/klicker/types"
import { formatMode, idToTag } from "../lib/util"
import { KlickerService } from '@schneefux/klicker/service'
import config from '../lib/klicker.cubes'
import visualisations from '../lib/klicker.visualisations.conf'
import staticWidgets from '../lib/klicker.widgets.conf'
import slicers from '../lib/klicker.slicers.conf'
import { dimensionRenderers, metricRenderers } from '../lib/klicker.renderers'
import { Query } from "@cubejs-client/core"

export interface EventMetadata {
  key: string
  id: string
  map: string
  mapTranslated: string
  mode: string
  modeTranslated: string
  start?: string
  end?: string
  powerplay: boolean
  metrics: Record<string, string|number>
}

export class BrawltimeKlickerService extends KlickerService {
  constructor(
    private cubeUrl: string|undefined,
    tokenProvider: () => Promise<string>,
    fetchImplementation: typeof fetch
  ) {
    if (!cubeUrl) {
      console.warn('CUBE_URL is not set, queries will be unavailable')
    }

    super(
      cubeUrl!,
      tokenProvider,
      config,
      visualisations,
      staticWidgets,
      slicers,
      dimensionRenderers,
      metricRenderers,
      fetchImplementation,
    )
  }

  protected async load(query: Query) {
    if (this.cubeUrl) {
      return super.load(query)
    } else {
      return Promise.reject()
    }
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
