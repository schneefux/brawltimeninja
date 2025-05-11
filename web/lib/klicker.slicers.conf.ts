import { SlicerSpec } from "@schneefux/klicker/types"
import { defineAsyncComponent } from "vue"

const slicers: SlicerSpec[] = [{
  name: 'Ally',
  component: 's-ally',
  import: defineAsyncComponent(() => import(/* webpackChunkName: "s-custom" */ '~/components/klicker/s-ally.vue')),
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'ally')
  },
}, {
  name: 'Brawler',
  component: 's-brawler',
  import: defineAsyncComponent(() => import(/* webpackChunkName: "s-custom" */ '~/components/klicker/s-brawler.vue')),
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'brawler')
  },
}, {
  name: 'Competition Winners',
  component: 's-competition-maps',
  import: defineAsyncComponent(() => import(/* webpackChunkName: "s-custom" */ '~/components/klicker/s-competition-maps.vue')),
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'map')
  },
}, {
  name: 'Maps and Modes',
  component: 's-mode-map',
  import: defineAsyncComponent(() => import(/* webpackChunkName: "s-custom" */ '~/components/klicker/s-mode-map.vue')),
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'mode') && dimensions.some(d => d.id == 'map')
  },
}, {
  name: 'Player Name',
  component: 's-player-name',
  import: defineAsyncComponent(() => import(/* webpackChunkName: "s-custom" */ '~/components/klicker/s-player-name.vue')),
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'playerName')
  },
}, {
  name: 'Player Tag',
  component: 's-player-tag',
  import: defineAsyncComponent(() => import(/* webpackChunkName: "s-custom" */ '~/components/klicker/s-player-tag.vue')),
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'player')
  },
}, {
  name: 'Power Level',
  component: 's-power',
  import: defineAsyncComponent(() => import(/* webpackChunkName: "s-custom" */ '~/components/klicker/s-power.vue')),
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'power')
  },
}, {
  name: 'Power Play',
  component: 's-powerplay',
  import: defineAsyncComponent(() => import(/* webpackChunkName: "s-custom" */ '~/components/klicker/s-powerplay.vue')),
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'powerplay')
  },
}, {
  name: 'Season',
  component: 's-season',
  import: defineAsyncComponent(() => import(/* webpackChunkName: "s-custom" */ '~/components/klicker/s-season.vue')),
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'season')
  },
}, {
  name: 'Trophies',
  component: 's-trophies',
  import: defineAsyncComponent(() => import(/* webpackChunkName: "s-custom" */ '~/components/klicker/s-trophies.vue')),
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'trophyRange')
  },
}, {
  name: 'Player Trophies',
  component: 's-player-trophies',
  import: defineAsyncComponent(() => import(/* webpackChunkName: "s-custom" */ '~/components/klicker/s-player-trophies.vue')),
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'playerTrophyRange')
  },
}, {
  name: 'With Gadget',
  component: 's-with-gadget',
  import: defineAsyncComponent(() => import(/* webpackChunkName: "s-custom" */ '~/components/klicker/s-with-gadget.vue')),
  applicable(dimensions, cubeId) {
    return cubeId == 'gadget' && dimensions.some(d => d.id == 'gadget')
  },
}, {
  name: 'With Star Power',
  component: 's-with-starpower',
  import: defineAsyncComponent(() => import(/* webpackChunkName: "s-custom" */ '~/components/klicker/s-with-starpower.vue')),
  applicable(dimensions, cubeId) {
    return cubeId == 'starpower' && dimensions.some(d => d.id == 'starpower')
  },
}]

export default slicers
