import { DimensionRendererSpec, MetricRendererSpec } from '@schneefux/klicker/types'
import { defineAsyncComponent } from 'vue'

export const dimensionRenderers: DimensionRendererSpec[] = [{
  name: 'Map',
  component: 'd-map',
  import: defineAsyncComponent(() => import('~/components/klicker/d-map.vue')),
  applicable(dimension) {
    return dimension.some(d => d.id == 'map')
  },
  replacesDimensionIds: ['map'],
}, {
  name: 'Brawler',
  component: 'md-brawler',
  import: defineAsyncComponent(() => import('~/components/klicker/md-brawler.vue')),
  applicable(dimension) {
    return dimension.some(d => d.id == 'brawler' || d.id == 'starpower' || d.id == 'gadget')
  },
  replacesDimensionIds: ['brawler', 'starpower', 'gadget'],
}, {
  name: 'Gear',
  component: 'd-gear',
  import: defineAsyncComponent(() => import('~/components/klicker/d-gear.vue')),
  applicable(dimension) {
    return dimension.some(d => d.id == 'gear')
  },
  replacesDimensionIds: ['gear'],
}, {
  name: 'Mode',
  component: 'd-mode',
  import: defineAsyncComponent(() => import('~/components/klicker/d-mode.vue')),
  applicable(dimension) {
    return dimension.some(d => d.id == 'mode')
  },
  replacesDimensionIds: ['mode'],
}, {
  name: 'Player',
  component: 'd-player',
  import: defineAsyncComponent(() => import('~/components/klicker/d-player.vue')),
  applicable(dimension) {
    return dimension.some(d => d.id == 'player')
  },
  replacesDimensionIds: ['player'],
}, {
  name: 'Season',
  component: 'd-season',
  import: defineAsyncComponent(() => import('~/components/klicker/d-season.vue')),
  applicable(dimension) {
    return dimension.some(d => d.id == 'season')
  },
  replacesDimensionIds: ['season'],
}, {
  name: 'Team',
  component: 'd-team',
  import: defineAsyncComponent(() => import('~/components/klicker/d-team.vue')),
  applicable(dimension) {
    return dimension.some(d => d.id == 'team')
  },
  replacesDimensionIds: ['team'],
}]

export const metricRenderers: MetricRendererSpec[] = [{
  name: 'Brawler',
  component: 'md-brawler',
  import: defineAsyncComponent(() => import('~/components/klicker/md-brawler.vue')),
  applicable(metrics) {
    return metrics.some(m => m.id == 'brawler')
  },
  replacesMetricId: 'brawler',
}]
