import { SlicerSpec } from "~/klicker"

// TODO refactor slicers:
//  * Build <s-if-applicable>
//  * Remove slicer specs from cube configuration
//  * Emit Filters from slicers directly

const slicers: SlicerSpec[] = [{
  name: 'Ally',
  component: 's-ally',
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'ally')
  },
}, {
  name: 'Brawler',
  component: 's-brawler',
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'brawler')
  },
}, {
  name: 'Competition Winners',
  component: 's-competition-maps',
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'map')
  },
}, {
  name: 'Maps and Modes',
  component: 's-mode-map',
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'mode') && dimensions.some(d => d.id == 'map')
  },
}, {
  name: 'Player Name',
  component: 's-player-name',
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'playerName')
  },
}, {
  name: 'Player Tag',
  component: 's-player-tag',
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'player')
  },
}, {
  name: 'Power Level',
  component: 's-power',
  applicable(dimensions, measurements) {
    return measurements.some(d => d.id == 'power')
  },
}, {
  name: 'Power Play',
  component: 's-powerplay',
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'powerplay')
  },
}, {
  name: 'Season',
  component: 's-season',
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'season')
  },
}, {
  name: 'Trophies',
  component: 's-trophies',
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'trophyRange')
  },
}, {
  name: 'With Gadget',
  component: 's-with-gadget',
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'gadget')
  },
}, {
  name: 'With Star Power',
  component: 's-with-starpower',
  applicable(dimensions) {
    return dimensions.some(d => d.id == 'starpower')
  },
}]

export default slicers
